const core = require('./core')
const cssLoader = require('./loaders/css-loader')
const tsLoader = require('./loaders/ts-loader')
const HtmlPlugin = require('./plugins/html-plugin')
const CssTransformer = require('./core/transformer/css')
const TsTransformer = require('./core/transformer/ts')
const HtmlTransformer = require('./core/transformer/html')

module.exports = {
  core,
  cssLoader,
  tsLoader,
  HtmlPlugin,
  CssTransformer,
  TsTransformer,
  HtmlTransformer,
}