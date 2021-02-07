const ts = require('typescript')
const TsProcessor = require('./ts-processor')
const { transformCgi } = require('../utils/url-parser')
const {
  getParseBase64Promise,
  getParseJsPromise
} = require('../utils/http')

class TsTransformer {
  constructor(filename, code, opts) {
    this.filename = filename || `temp-${Date.now()}`
    this.code = code
    this.sourceFile = ts.createSourceFile(
      this.filename,
      code,
      ts.ScriptTarget.Latest,
      /*setParentNodes */ true
    )
    this.processor = new TsProcessor(this.sourceFile, { ...opts })
  }

  transformCode() {
    const changeset = this.processor.getChangeset()
    let transformedCode = this.code
    const genNewCodePromise = (cs, isSpecific) => {
      let targetCs
      if (!isSpecific) {
        const { location, node, text, styleUrls } = cs
        if (!ts.isTemplateExpression(node) && (styleUrls || location.ext && location.ext !== 'js')) {
          // not support template
          const promises = (styleUrls || [location]).map(({ href }) => getParseBase64Promise(href))
          let newText = text
          return Promise
            .all(promises)
            .then(res => res.forEach((v, i) => v && (newText = styleUrls ? newText.replace(styleUrls[i].origin, v) : v)))
            .then(() => {
              let newNode = null
              if (ts.isStringLiteral(node)) {
                newNode = ts.createStringLiteral(newText)
              } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
                newNode = ts.createNoSubstitutionTemplateLiteral(newText)
              }
              return newNode && {
                ...cs,
                target: ts.createPrinter().printNode(ts.EmitHint.Unspecified, newNode, changeset.sourceFile)
              }
            })
        }
        targetCs = cs
      } else {
        if (!cs.child) return Promise.resolve()
        targetCs = cs.child[0].value[0]
      }
      // cgi
      const { node, location } = targetCs
      if (location.ext) return Promise.resolve()
      const newUrl = transformCgi(location)
      let newNode = null
      if (ts.isStringLiteral(node)) {
        newNode = ts.createStringLiteral(newUrl)
      } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
        newNode = ts.createNoSubstitutionTemplateLiteral(newUrl)
      } else if (ts.isTemplateExpression(node)) {
        newNode = ts.createTemplateExpression(ts.createTemplateHead(newUrl), node.templateSpans)
      }
      if (!newNode) return Promise.resolve()
      if (isSpecific) {
        newNode = ts.transform(cs.node, [(context) => (root) => {
          const nodeVisitor = (old) => old === node ? newNode : ts.visitEachChild(old, nodeVisitor, context)
          return ts.visitNode(root, nodeVisitor)
        }]).transformed[0]
      }
      return Promise.resolve({
        cs,
        target: ts.createPrinter().printNode(ts.EmitHint.Unspecified, newNode, changeset.sourceFile)
      })
    }
    const promises = changeset.value.map((cs) => genNewCodePromise(cs, cs.access instanceof Array))
    return Promise.all(promises).then(res => {
      let diff = 0
      res.forEach(cs => {
        if (!cs) return
        transformedCode = transformedCode.substr(0, cs.start + diff) + cs.target + transformedCode.substr(cs.end + diff)
        diff += cs.target.length - cs.end + cs.start
      })
      return transformedCode
    })
  }
}

module.exports = TsTransformer