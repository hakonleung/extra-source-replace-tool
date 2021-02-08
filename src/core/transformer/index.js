const path = require('path')
const core = require('..')

class Transformer {
  constructor(loader, filename, code, meta, options = core.options) {
    const context = options.context || process.cwd()
    this.filename = filename ? path.relative(context, filename) : `temp-${Date.now()}`
    this.code = code
    this.loader = loader
    this.options = options
    this.meta = meta
    this.init()
  }

  init() {}

  async transform() {}
}

module.exports = Transformer