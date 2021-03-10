const path = require('path')
const webpack = require('webpack')
const { createFsFromVolume, Volume } = require('memfs')
const { ROOT, FIXTURES_PATH } = require('./constant')

const tsLoader = path.resolve(ROOT, './src/loaders/ts-loader')
const cssLoader = path.resolve(ROOT, './src/loaders/css-loader')
const babelOptions = require('../.babelrc')
const exclude = [/node_modules/]

module.exports = (fixture, config = {}) => {
  const fullConfig = {
    mode: 'development',
    devtool: config.devtool || false,
    context: FIXTURES_PATH,
    entry: path.resolve(FIXTURES_PATH, fixture),
    output: {
      path: path.resolve(__dirname, '../outputs'),
      filename: '[name].bundle.js',
      chunkFilename: '[name].chunk.js',
      publicPath: '/webpack/public/path/',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude,
          use: [
            {
              loader: 'babel-loader',
              options: babelOptions,
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                configFile: path.resolve(__dirname, '../tsconfig.json'),
              },
            },
            {
              loader: tsLoader,
            },
          ],
        },
        {
          test: /\.js$/,
          exclude,
          use: [
            // {
            //   loader: 'babel-loader',
            //   options: babelOptions
            // },
            {
              loader: tsLoader,
            },
          ],
        },
        {
          test: /\.css$/,
          exclude,
          use: ['css-loader', cssLoader],
        },
      ],
    },
    optimization: {
      minimize: false,
    },
    stats: {
      all: true,
      chunks: true,
      errors: true,
      errorDetails: true,
      source: true,
    },
    ...config,
  }

  const compiler = webpack(fullConfig)

  if (!config.outputFileSystem) {
    const outputFileSystem = createFsFromVolume(new Volume())

    outputFileSystem.join = path.join.bind(path)

    compiler.outputFileSystem = outputFileSystem
  }

  return compiler
}
