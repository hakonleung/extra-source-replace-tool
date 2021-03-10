const path = require('path')
const { ROOT } = require('../helpers/constant')
const tsLoader = path.resolve(ROOT, './src/loaders/ts-loader')
const cssLoader = path.resolve(ROOT, './src/loaders/css-loader')
const exclude = [/node_modules/]
const babelOptions = require('../.babelrc')
const cssLoaders = ['style-loader', 'css-loader', cssLoader, 'postcss-loader']

module.exports = {
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
            configFile: '../tsconfig.json',
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
        {
          loader: 'babel-loader',
          options: babelOptions,
        },
        {
          loader: tsLoader,
        },
      ],
    },
    {
      test: /\.css$/,
      exclude,
      use: cssLoaders,
    },
  ],
}
