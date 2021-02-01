const config = require('./core/config')
const cssLoader = require('./loaders/css-loader')
const tsLoader = require('./loaders/ts-loader')
const HtmlPlugin = require('./plugins/html-plugin')

module.exports = {
  config,
  cssLoader,
  tsLoader,
  HtmlPlugin
}