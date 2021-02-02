const webpack = require('webpack')
const path = require('path')
const plugins = require('./plugins')
const modules = require('./modules')
const { devServer } = require('./dev-server')

const obeserver = {}
Object.defineProperty(obeserver, 'outputPath', {
  get() {
    return path.resolve(process.cwd(), process.env.NODE_ENV === 'development' ? 'dev' : 'dist')
  },
})
Object.defineProperty(obeserver, 'filename', {
  get() {
    return '[name]-[contenthash].js'
  },
})

const config = {
  mode: process.env.NODE_ENV,
  entry: path.resolve(process.cwd(), './src/index.ts'),
  output: {
    filename: obeserver.filename,
    path: obeserver.outputPath,
  },
  context: process.cwd(),
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