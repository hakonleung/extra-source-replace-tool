const path = require('path')

const webpack = require('webpack')
const HakonPlugin = require('./hakon')
const WriteFilePlugin = require('write-file-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const StatsPlugin = require('stats-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = [
  new HtmlWebpackPlugin({
    template: path.resolve(process.cwd(), 'src/index.html')
  }),
  new HakonPlugin(),
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