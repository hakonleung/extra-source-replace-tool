const ts = require('typescript')
const TsProcessor = require('../processor/ts')
const { transformCgi } = require('../../utils/url-parser')
const {
  getParseBase64Promise,
  getParseJsPromise
} = require('../../utils/http')
const logger = require('../../utils/logger')
const { printNode } = require('../../utils/ast')
const Transformer = require('.')
const core = require('../')

class TsTransformer extends Transformer {
  init() {
    this.sourceFile = ts.createSourceFile(this.filename, this.code, ts.ScriptTarget.Latest, /*setParentNodes */ true)
    this.processor = new TsProcessor(this.sourceFile, { ...this.options })
  }

  transformAsync() {
    const { changeset } = this.processor.traverse()
    let transformedCode = this.code
    const genNewCodePromise = (cs, isSpecific) => {
      let targetCs
      if (!isSpecific) {
        const { location, locations, node, text } = cs
        if (!ts.isTemplateExpression(node) && (locations || location.ext && location.ext !== 'js')) {
          // not support template
          const promises = (locations || [location]).map(({ href }) => getParseBase64Promise(href))
          let newText = text
          return Promise
            .all(promises)
            .then(res => res.forEach((v, i) => v && (newText = locations ? newText.replace(locations[i].origin, v) : v)))
            .then(() => {
              let newNode = null
              if (ts.isStringLiteral(node)) {
                newNode = ts.createStringLiteral(newText)
              } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
                newNode = ts.createNoSubstitutionTemplateLiteral(newText)
              }
              return newNode && {
                ...cs,
                target: printNode(newNode, changeset.sourceFile)
              }
            })
        }
        targetCs = cs
      } else {
        if (!cs.child || !(targetCs = cs.child.value[0])) return Promise.resolve()
      }
      // cgi
      const { node, location } = targetCs
      if (location.ext) return Promise.resolve()
      const newUrl = transformCgi(location, core.options)
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
        ...cs,
        target: printNode(newNode, changeset.sourceFile)
      })
    }
    const promises = changeset.value.map((cs) => genNewCodePromise(cs, cs.access instanceof Array))
    return Promise.all(promises).then(res => {
      let diff = 0
      res.forEach(cs => {
        if (!cs) return
        // recover prefix space
        const oldCode = transformedCode.substr(cs.start + diff, cs.end - cs.start)
        const newCode = (oldCode.match(/^\s+/) || [''])[0] + cs.target
        logger.info('ts', `file: ${this.filename}`, `from: ${oldCode.slice(0, 66)}...`, `to: ${newCode.slice(0, 66)}...`)
        transformedCode = transformedCode.substr(0, cs.start + diff) + newCode + transformedCode.substr(cs.end + diff)
        diff += newCode.length - cs.end + cs.start
      })
      return transformedCode
    })
  }
}

module.exports = TsTransformer