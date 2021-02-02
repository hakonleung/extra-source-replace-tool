const ts = require('typescript')
const TsProcessor = require('./ts-processor')

class TsTransformer {
  constructor(filename, code, options) {
    this.filename = filename
    this.code = code
    this.sourceFile = ts.createSourceFile(
      filename,
      code,
      ts.ScriptTarget.Latest,
      /*setParentNodes */ true
    )
    this.processor = new TsProcessor(this.sourceFile, {...options})
  }

  getTransformCode() {
    this.changeset = this.processor.getChangeset()
    debugger
    return Promise.resolve()
  }
}

module.exports = TsTransformer