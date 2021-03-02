const webpack = require('webpack')
const path = require('path')
const plugins = require('./plugins')
const modules = require('./modules')
const { OUTPUT_PATH } = require('./constant')
const core = require('../../src/core')

core.config({
  // requestTimeout: 50
  loggerTransports: ['console', 'file']
}, true)

const obeserver = {}
Object.defineProperty(obeserver, 'outputPath', {
  get() {
    return path.resolve(OUTPUT_PATH, process.env.NODE_ENV === 'development' ? 'dev' : 'dist')
  },
})
Object.defineProperty(obeserver, 'filename', {
  get() {
    return '[name]-[contenthash].js'
  },
})

const config = {
  mode: process.env.NODE_ENV,
  entry: path.resolve(OUTPUT_PATH, './src/index.ts'),
  output: {
    filename: obeserver.filename,
    path: obeserver.outputPath,
  },
  context: OUTPUT_PATH,
  devtool: 'cheap-module-source-map',
  // watch: true,
  // watchOptions: {
  // 	ignored: ['node_modules', 'script', 'lib', 'doc', 'test', 'dist'],
  // 	aggregateTimeout: 300,
  // },
  module: modules,
  plugins,
  stats: {
    all: true,
    chunks: true,
    errors: true,
    errorDetails: true,
    warnings: true,
    timings: true,
    colors: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
}

const compiler = webpack(config)

// if (process.env.NODE_ENV === 'development') {
//   devServer(compiler)
// } else {
  compiler.run((err, stats) => {
    console.log(err)
    console.log(
      stats.toString({
        all: false,
        chunks: false,
        errors: true,
        errorDetails: false,
        warnings: false,
        timings: false,
        colors: true,
      })
    )
  })
// }