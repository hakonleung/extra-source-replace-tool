// If your plugin is direct dependent to the html webpack plugin:
const HtmlWebpackPlugin = require('html-webpack-plugin')
// If your plugin is using html-webpack-plugin as an optional dependency
// you can use https://github.com/tallesl/node-safe-require instead:
// const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin')
const templateTransform = require('../core/template-transform')

class HtmlLinkTransformPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('HtmlLinkTransformPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'HtmlLinkTransformPlugin',
        (data, cb) => templateTransform(data.html).then(html => cb(null, { ...data, html }))
      )
    })
  }
}

module.exports = HtmlLinkTransformPlugin
