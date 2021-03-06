const ts = require('typescript')
const TsProcessor = require('../processor/ts')
const { transformCgi } = require('../../utils/url-parser')
const { getParseBase64Promise } = require('../../utils/http')
const { printNode } = require('../../utils/ast')
const Transformer = require('.')

class TsTransformer extends Transformer {
  init() {
    this.sourceFile = ts.createSourceFile(this.filename, this.code, ts.ScriptTarget.Latest, /*setParentNodes */ true)
    this.processor = new TsProcessor(this.sourceFile, this.core.options)
  }

  transformAsync() {
    const { changeset } = this.processor.traverse()
    let transformedCode = this.code
    const genNewCodePromise = (cs, isSpecific) => {
      let targetCs
      if (!isSpecific) {
        const { location, locations, node, text } = cs
        if (!ts.isTemplateExpression(node) && (locations || (location.ext && location.ext !== 'js'))) {
          // not support template
          const promises = (locations || [location]).map(({ href }) => getParseBase64Promise(href, this.core))
          let newText = text
          return Promise.all(promises)
            .then((res) =>
              res.forEach((v, i) => v && (newText = locations ? newText.replace(locations[i].origin, v) : v))
            )
            .then(() => {
              if (newText === text) return
              let newNode = null
              if (ts.isStringLiteral(node)) {
                newNode = ts.createStringLiteral(newText)
              } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
                newNode = ts.createNoSubstitutionTemplateLiteral(newText)
              }
              return (
                newNode && {
                  ...cs,
                  target: printNode(newNode, changeset.sourceFile),
                }
              )
            })
        }
        targetCs = cs
      } else {
        if (!cs.child || !(targetCs = cs.child.value[0])) return Promise.resolve()
      }
      // cgi
      const { node, location } = targetCs
      if (location.ext) return Promise.resolve()
      const newUrl = transformCgi(location, this.core.options)
      if (
        (!location.inside && !this.core.options.extraBlock) ||
        newUrl === (ts.isTemplateExpression(node) ? node.head.text : node.text)
      )
        return Promise.resolve()
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
        newNode = ts.transform(
          cs.node,
          [
            (context) => (root) => {
              const nodeVisitor = (old) => (old === node ? newNode : ts.visitEachChild(old, nodeVisitor, context))
              return ts.visitNode(root, nodeVisitor)
            },
          ],
          { jsx: ts.JsxEmit.React }
        ).transformed[0]
      }
      return Promise.resolve({
        ...cs,
        target: printNode(newNode, changeset.sourceFile),
      })
    }
    const promises = changeset.value.map((cs) => genNewCodePromise(cs, cs.access instanceof Array))
    return Promise.all(promises).then((res) => {
      let diff = 0
      res.forEach((cs) => {
        if (!cs) return
        // recover prefix space
        // const oldCode = transformedCode.substr(cs.start + diff, cs.end - cs.start)
        // const newCode = (oldCode.match(/^\s+/) || [''])[0] + cs.target
        try {
          cs.start = cs.node.getStart()
        } catch (err) {
          // debugger
        }
        const oldCode = transformedCode.substr(cs.start + diff, cs.end - cs.start)
        const newCode = cs.target
        this.log({
          code: oldCode,
          transformed: newCode,
        })
        transformedCode = transformedCode.substr(0, cs.start + diff) + newCode + transformedCode.substr(cs.end + diff)
        diff += newCode.length - cs.end + cs.start
      })
      return transformedCode
    })
  }
}

module.exports = TsTransformer
