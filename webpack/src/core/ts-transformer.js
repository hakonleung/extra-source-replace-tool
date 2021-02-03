const ts = require('typescript')
const TsProcessor = require('./ts-processor')
const { options } = require('./')

const validBinaryAccesses = [
  ['window', 'location'],
  ['window', 'location', 'href'],
]

const validCallAccesses = [
  ['window', 'open'],
  ['window', 'location', 'replace'],
]

const isAccessValid = (access, validAccesses) => {
  return access.length > 0 && validAccesses.some(validAccess => {
    let validStart = 0
    let accessStart = 0
    if (validAccess[0] === options.global) {
      validStart = 1
      if (access[0].text === options.global || options.globalAlias.includes(access[0].text)) {
        accessStart = 1
      }
    }
    const compareValidAccess = validAccess.slice(validStart)
    const compareAccess = access.slice(accessStart)
    return compareValidAccess.length === compareAccess.length && compareAccess.every((v, i) => v.text === compareValidAccess[i])
  })
}

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
    changeset.changesets.forEach((cs, i) => {
      const { node, text, access } = cs
      if (access instanceof Array) {
        let isValid = false
        if (ts.isCallExpression(node)) {
          isValid = isAccessValid(access, validCallAccesses)
        } else if (ts.isBinaryExpression(node)) {
          isValid = isAccessValid(access, validBinaryAccesses)
        }
      } else if (cs.text) {

      }
    })
    return Promise.resolve()
  }
}

module.exports = TsTransformer