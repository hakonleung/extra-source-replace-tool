// If your plugin is direct dependent to the html webpack plugin:
const HtmlWebpackPlugin = require('html-webpack-plugin')
// If your plugin is using html-webpack-plugin as an optional dependency
// you can use https://github.com/tallesl/node-safe-require instead:
// const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin')
const HtmlTransformer = require('../core/transformer/html')
const ESRTCore = require('../core')

class HtmlWebpackESRTPlugin {
  constructor(core = ESRTCore.getInstance()) {
    this.core = core
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('ESRTPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('ESRTPlugin', (data, cb) =>
        new HtmlTransformer({ code: data.html, plugin: data.plugin }, this.core)
          .transformAsync()
          .then((html) => cb(null, { ...data, html }))
          .then(() => this.core.logger.callback())
          .catch((e) => cb(e))
      )
    })
  }
}

module.exports = HtmlWebpackESRTPlugin
