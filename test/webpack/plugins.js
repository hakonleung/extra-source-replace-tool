const path = require('path')
const webpack = require('webpack')
const { HtmlPlugin } = require('../../src')
const WriteFilePlugin = require('write-file-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const StatsPlugin = require('stats-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { OUTPUT_PATH } = require('./constant')

module.exports = [
  new HtmlWebpackPlugin({
    template: path.resolve(OUTPUT_PATH, 'src/index.html')
  }),
  new HtmlPlugin(),
  // new webpack.NamedModulesPlugin(),
  new WriteFilePlugin(),
  // new webpack.BannerPlugin({
  //   banner: 'self.window = self;',
  //   raw: true,
  //   include: /public-worker/,
  // }),
  // new BundleAnalyzerPlugin({
  //   analyzerMode: 'server',
  //   analyzerHost: '127.0.0.1',
  //   analyzerPort: 8889,
  //   reportFilename: 'report.html',
  //   defaultSizes: 'parsed',
  //   openAnalyzer: true,
  //   generateStatsFile: false,
  //   statsFilename: 'stats.json',
  //   statsOptions: null,
  //   logLevel: 'info',
  // }),
  // new StatsPlugin('stats.json', {
  //   chunkModules: true,
  //   exclude: [/node_modules/],
  // }),
]