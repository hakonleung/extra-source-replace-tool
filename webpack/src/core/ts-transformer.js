const ts = require('typescript')
const TsProcessor = require('./ts-processor')
const { transformCgi } = require('../utils/url-parser')

class TsTransformer {
  constructor(filename, code, opts) {
    this.code = code
    this.sourceFile = ts.createSourceFile(
      filename || `temp-${Date.now()}`,
      code,
      ts.ScriptTarget.Latest,
      /*setParentNodes */ true
    )
    this.processor = new TsProcessor(this.sourceFile, {...opts})
  }

  transformCode() {
    const changeset = this.processor.getChangeset()
    let transformedCode = this.code
    const promises = []
    const genNewCode = (cs, parent) => {
      const { node, location } = cs
      const newUrl = transformCgi(location)
      let newNode = null
      if (ts.isStringLiteral(node)) {
        newNode = ts.createStringLiteral(newUrl)
      } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
        newNode = ts.createNoSubstitutionTemplateLiteral(newUrl)
      } else if (ts.isTemplateExpression(node)) {
        newNode = ts.createTemplateExpression(ts.createTemplateHead(newUrl), node.templateSpans)
      }
      if (!newNode) return
      if (parent) {
        newNode = ts.transform(parent, [(context) => (root) => {
          const nodeVisitor = (old) => old === node ? newNode : ts.visitEachChild(old, nodeVisitor, context)
          return ts.visitNode(root, nodeVisitor)
        }]).transformed[0]
      }
      return ts.createPrinter().printNode(ts.EmitHint.Unspecified, newNode, changeset.sourceFile)
    }
    changeset.value.forEach((cs) => {
      const { node, text, access, child } = cs
      let target
      if (access instanceof Array && child) {
        // replace expression such as "location = 'xxx'", "window.open('xxx')"
        target = genNewCode(child[0].value[0], node)
      } else if (text) {
        // replace string
        target = genNewCode(cs)
      }
      if (target !== undefined) {
        promises.push(Promise.resolve({
          ...cs,
          target
        }))
      }
    })
    return Promise.all(promises).then(res => {
      let diff = 0
      res.forEach(cs => {
        transformedCode = transformedCode.substr(0, cs.start + diff) + cs.target + transformedCode.substr(cs.end + diff)
        diff += cs.target.length - cs.end + cs.start
      })
      return transformedCode
    })
  }
}

module.exports = TsTransformer