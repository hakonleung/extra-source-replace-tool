const path = require('path')
const core = require('..')
const logger = require('../../utils/logger')

class Transformer {
  constructor({ code, map, meta, filename, parent, loader, plugin }, options = core.options) {
    this.code = code
    this.map = map
    this.meta = meta
    this.filename = filename ? path.relative(options.context || process.cwd(), filename) : `temp-${Date.now()}`
    this.parent = parent
    this.options = options
    this.loader = loader
    this.plugin = plugin
    this.init()
  }

  init() {}

  transform() {}

  async transformAsync() {}

  log(options, type = 'info') {
    logger[type] && logger[type]({
      ...options,
      filename: this.filename,
      parent: this.parent,
      type: this.__proto__.constructor.name.replace('Transformer', '').toLowerCase()
    })
  }
}

module.exports = Transformer