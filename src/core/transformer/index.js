const path = require('path')
const core = require('..')

class Transformer {
  constructor({ code, map, meta, filename }, loader, options = core.options) {
    this.code = code
    this.map = map
    this.filename = filename ? path.relative(options.context || process.cwd(), filename) : `temp-${Date.now()}`
    this.options = options
    this.loader = loader
    this.init()
  }

  init() {}

  transform() {}

  async transformAsync() {}
}

module.exports = Transformer