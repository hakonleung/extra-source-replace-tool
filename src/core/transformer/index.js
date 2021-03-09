const path = require('path')
const ESRTCore = require('../base')

class Transformer {
  constructor({ code, map, meta, filename, parent, loader, plugin }, core = ESRTCore.getInstance()) {
    this.code = code
    this.map = map
    this.meta = meta
    this.filename = filename ? path.relative(core.options.context || process.cwd(), filename) : `temp-${Date.now()}`
    this.parent = parent
    this.loader = loader
    this.plugin = plugin
    this.core = core
    this.setFilename(filename)
    this.init()
  }

  setFilename(filename) {
    if (!filename) {
      if (this.loader) {
        filename = this.loader.resourcePath
      } else if (this.plugin) {
        filename = this.plugin.options.template.split('!').slice(-1)[0]
      } else {
        filename = `temp-${Date.now()}`
      }
    }
    this.filename = filename
  }

  init() {}

  transform() {}

  async transformAsync() {}

  log(options, type = 'info') {
    const { logger } = this.core
    if (!logger || !logger[type]) return
    logger[type]({
      ...options,
      filename: this.filename,
      parent: this.parent,
      type: this.__proto__.constructor.name.replace('Transformer', '').toLowerCase(),
    })
  }
}

module.exports = Transformer
