const TsTransformer = require('../core/transformer/ts')
const { isIgnoreFile } = require('../utils/ast')

module.exports = function (code, map) {
  const filename = this.currentRequest.split('!').slice(-1)[0]
  if (isIgnoreFile(code, map, filename)) {
    return code
  }
  this.cacheable && this.cacheable(false)
  const callback = this.async()
  new TsTransformer(this, filename, code)
    .transform()
    .then(transformedCode => callback(null, transformedCode))
    .catch(e => callback(e, null))
}