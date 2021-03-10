const { isIgnoreFile } = require('../utils/ast')
const ESRTCore = require('../core')

module.exports = (Transformer, options = {}) => {
  return function (code, map, meta) {
    const filename = this.currentRequest.split('!').slice(-1)[0]
    if (isIgnoreFile(filename, code, map, ESRTCore.getInstance().options)) {
      return code
    }
    // if (options.nocache && typeof this.cacheable === 'function') {
    //   this.cacheable(false)
    // }
    const transformer = new Transformer({ code, map, meta, filename, loader: this }, ESRTCore.getInstance())
    // if (options.sync) {
    //   return transformer.transform()
    // }
    const callback = this.async()
    transformer
      .transformAsync()
      .then((...res) => callback(null, ...res))
      .catch((e) => callback(e))
  }
}
