const ts = require('typescript')
const TsProcessor = require('./ts-processor')
const { options } = require('./')

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

  getTransformCode() {
    const changeset = this.processor.getChangeset()
    let diff = 0
    let transformedCode = this.code
    debugger
    changeset.changesets.forEach((cs, i) => {
      const { node, text, access } = cs
      if (access instanceof Array) {
        // replace expression

      } else if (cs.text) {
        // replace string

      }
    })
    return Promise.resolve()
  }
}

module.exports = TsTransformer