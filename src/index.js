const core = require('./core')
const cssLoader = require('./loaders/css-loader')
const tsLoader = require('./loaders/ts-loader')
const HtmlPlugin = require('./plugins/html-plugin')

module.exports = {
  core,
  cssLoader,
  tsLoader,
  HtmlPlugin
}