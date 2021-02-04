const ts = require('typescript')
const TsProcessor = require('./ts-processor')
const { options } = require('./')
const { transformCgi } = require('../utils/url-parser')

class TsTransformer {
  constructor(filename, code, opts) {
    this.filename = filename
    this.code = code
    this.sourceFile = ts.createSourceFile(
      filename,
      code,
      ts.ScriptTarget.Latest,
      /*setParentNodes */ true
    )
    this.processor = new TsProcessor(this.sourceFile, {...opts})
  }

  transformCode() {
    const changeset = this.processor.getChangeset()
    let diff = 0
    let transformedCode = this.code
    const promises = []
    changeset.changesets.forEach((cs, i) => {
      const { node, text, access, child, location } = cs
      if (access instanceof Array && child) {
        // replace expression such as "location = 'xxx'", "window.open('xxx')"
        const { node: firstChild, text: firstChildText, location: firstChildLocation } = child[0].changesets[0]
        const newUrl = transformCgi(firstChildLocation)
        let newFirstChild = null
        if (ts.isStringLiteral(firstChild)) {
          newFirstChild = ts.createStringLiteral(newUrl)
        } else if (ts.isNoSubstitutionTemplateLiteral(firstChild)) {
          newFirstChild = ts.createNoSubstitutionTemplateLiteral(newUrl)
        } else if (ts.isTemplateExpression(firstChild)) {
          newFirstChild = ts.createTemplateExpression(ts.createTemplateHead(newUrl), firstChild.templateSpans)
        }
        if (!newFirstChild) return

        const newAst = ts.transform(node, [(context) => (root) => {
          const nodeVisitor = (old) => old === firstChild ? newFirstChild : ts.visitEachChild(old, nodeVisitor, context)
          return ts.visitNode(root, nodeVisitor)
        }])
        const newText = ts.createPrinter().printNode(ts.EmitHint.Unspecified, newAst.transformed[0], changeset.sourceFile)
        promises.push(Promise.resolve({
          ...cs,
          target: newText
        }))
      } else if (text) {
        // replace string
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
        const newText = ts.createPrinter().printNode(ts.EmitHint.Unspecified, newNode, changeset.sourceFile)
        promises.push(Promise.resolve({
          ...cs,
          target: newText
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