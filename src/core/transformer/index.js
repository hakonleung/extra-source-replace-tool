const path = require('path')

class Transformer {
  constructor({ code, map, meta, filename, parent, loader, plugin }, options = {}, logger) {
    this.code = code
    this.map = map
    this.meta = meta
    this.filename = filename ? path.relative(options.context || process.cwd(), filename) : `temp-${Date.now()}`
    this.parent = parent
    this.options = options
    this.loader = loader
    this.plugin = plugin
    this.logger = logger
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
    if (!this.logger || !this.logger[type]) return
    this.logger[type]({
      ...options,
      filename: this.filename,
      parent: this.parent,
      type: this.__proto__.constructor.name.replace('Transformer', '').toLowerCase(),
    })
  }
}

module.exports = Transformer
