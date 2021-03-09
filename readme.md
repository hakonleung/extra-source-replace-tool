# Usage

## config
```js
const DEFAULT_OPTIONS = {
  context: process.cwd(), // root path, used to generate relative filepath

  extraBlock: false, // whether transform extra path to empty string

  globalAlias: ['window', 'windowAsAny', 'global'], // default top level object

  injectBlockMethod: false, // whether inject method which proxy ajax and window.open to document`s head tag

  intraBlock: false, // whether transform intra path which is not in intraPathTopLevelRules to empty string
  intraBlockPaths: [], // intra path which is always transformed to empty string
  intraHosts: [], // hosts regarded as intra host
  intraPathSecondLevelRules: {}, // second level intra path transformed rules
  intraPathTopLevelRules: {}, // top level intra path transformed rules, for example, { test: 'testcgi' } means '/test/a' should be transformed to '/testcgi/a'
  intraProtocol: 'https', // default protocol

  loggerCodeLength: 100, // intercept log code
  loggerDataToJson: true, // save structured log info to json file
  loggerTransports: ['file'], // logger transports, optional config are file and console

  requestRetryTimes: 3, // fetch retry times
  requestTimeout: 3000, // fetch timeout
  
  transformCgi: null, // method which transform intra cgi

  transformerCgiEqualExprAccesses: [
    'window.location',
    'window.location.href',
  ], // expr.right regarded as cgi url, for example, 'window.location.href = 'xxx'' means xxx regarded as cgi url
  transformerCgiCallExprAccesses: [
    'window.open',
    'window.location.replace',
  ], // expr.arguments[0] regarded as cgi url
  transformerIgnoreEqualExprAccesses: [], // ignore binary expression with equal operation
  transformerIgnoreCallExprAccesses: [],
  transformerIgnorePathReg: null, // regexp used to ignore filepath
}
```

## loader & plugin
```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ESRTCore, HtmlPlugin: ESRTHtmlPlugin } = require('extra-source-replace-tool/src')

const ESRTTsLoader = 'extra-source-replace-tool/src/loaders/ts-loader'
const ESRTCssLoader = 'extra-source-replace-tool/src/loaders/css-loader'

// generate core instance and configure first
ESRTCore.getInstance().configure(options, /* provide several default options */type)



// webpack config
const webpackConfig = {
  module: {
    rules: {
      {
        test: /\.ts(x?)$/,
        loader: ['babel-loader', 'ts-loader', /* before ts-loader */ESRTTsLoader],
      },
      {
        test: /\.js$/,
        loader: ['babel-loader', ESRTTsLoader],
      },
      {
        test: /css/,
        loader: [/* share meta.ast when used after postcss-loader */ESRTCssLoader, 'postcss-loader']
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin(),
    /* depend on HtmlWebpackPlugin */new ESRTHtmlPlugin(),
  ]
}
```


## node api
```js
const {
  ESRTCore,
  CssTransformer,
  TsTransformer,
  HtmlTransformer,
} = require('extra-source-replace-tool/src')

ESRTCore.getInstance().configure(options, /* provide several default options */type)

new TsTransformer({ code: someCode })
  .transformAsync()
  .then(transformedCode => {
    // do something
  })
```
