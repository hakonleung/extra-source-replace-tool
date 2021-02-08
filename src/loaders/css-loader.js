const factory = require('./factory')
const CssTransformer = require('../core/transformer/css')

module.exports = factory(CssTransformer, {
  nocache: true
})
