const path = require('path')
const webpack = require('webpack')
const WriteFilePlugin = require('write-file-webpack-plugin')

const config = {
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-source-map',
  mode: process.env.NODE_ENV,
  entry: path.resolve(__dirname, './inject.js'),
  output: {
    filename: `inject.${process.env.NODE_ENV}.js`,
    path: __dirname,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              sourceType: 'unambiguous',
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      chrome: '58',
                      ie: '10',
                    }
                  }
                ]
              ],
            }
          },
        ],
      },
    ]
  },
  plugins: [
    new WriteFilePlugin()
  ],
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
    extensions: [".js"]
  },
}

try {
  webpack(config).run((err, stats) => {
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
} catch (e) {
  debugger
}
