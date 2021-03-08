// If your plugin is direct dependent to the html webpack plugin:
const HtmlWebpackPlugin = require('html-webpack-plugin')
// If your plugin is using html-webpack-plugin as an optional dependency
// you can use https://github.com/tallesl/node-safe-require instead:
// const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin')
const HtmlTransformer = require('../core/transformer/html')
const logger = require('../utils/logger')
const core = require('../core')

class HtmlWebpackESRTPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('ESRTPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('ESRTPlugin', (data, cb) =>
        new HtmlTransformer({ code: data.html, plugin: data.plugin }, core.options, logger)
          .transformAsync()
          .then((html) => cb(null, { ...data, html }))
          .then(() => logger.callback())
          .catch((e) => cb(e))
      )
    })
  }
}

module.exports = HtmlWebpackESRTPlugin
