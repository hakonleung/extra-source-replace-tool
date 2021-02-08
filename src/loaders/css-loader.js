const { isIgnoreFile } = require('../utils/ast')
const CssTransformer = require('../core/transformer/css')

module.exports = function (code, map, meta) {
  const filename = this.currentRequest.split('!').slice(-1)[0]
  if (isIgnoreFile(code, map, filename)) {
    return code
  }
  this.cacheable && this.cacheable(false)
  const callback = this.async()
  new CssTransformer(this, filename, code, map, meta)
    .transform()
    .then(({css, map, meta}) => callback(null, css, map ? map.toJSON() : undefined, meta))
    .catch(e => callback(e))
}