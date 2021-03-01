# Usage

## config
```js
const DEFAULT_OPTIONS = {
  protocol: 'https', // url parser
  ignorePath: null, // ignore filepath regexp
  context: process.cwd(), // root path
  global: 'window', // default top variable
  globalAlias: ['windowAsAny', 'global'],
  origins: [], // url origins regarded as intra source
  matchBinaryAccesses: [
    ['window', 'location'],
    ['window', 'location', 'href'],
  ],
  matchCallAccesses: [
    ['window', 'open'],
    ['window', 'location', 'replace'],
  ],
  ignoreBinaryAccesses: [], // ignore binary expression, for example, [['location', 'href']] means ignore 'window.location.href = 'xxx''
  ignoreCallAccesses: [],
  transformCgi: null, // method which transform intra cgi
  blockExtraUrl: false, // if trusy, transform extra path to empty string
  blockPaths: [], // intra path which transformed to empty string
  blockIntraUrl: false, // if trusy, transform intra path which l1PathMap dont include to empty string
  l1PathMap: {}, // top level intra path transform to
  l2PathMap: {}, // second level intra path transform to
  injectBlockMethod: false, // inject method which proxy ajax and window.open to document`s head tag
  requestTimeout: 3000, // fetch timeout
  requestRetryTimes: 3, // fetch retry times
}
```

## loader
```js
const ESRTool_CORE = require('extra-source-replace-tool/src/core')
ESRTool_CORE.config({}, true)

const ESRT_TS_LOADER = 'extra-source-replace-tool/src/loaders/ts-loader'
const ESRT_CSS_LOADER = 'extra-source-replace-tool/src/loaders/css-loader'

// webpack config module.rules
const rules = {
  {
    test: /\.ts(x?)$/,
    loader: ['babel-loader', 'ts-loader', ESRT_TS_LOADER],
  },
  {
    test: /\.js$/,
    loader: ['babel-loader', ESRT_TS_LOADER],
  },
  {
    test: /css/,
    loader: [ESRT_CSS_LOADER, 'postcss-loader']
  }
}
```

## plugin
```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { core, HtmlPlugin } = require('extra-source-replace-tool')
core.config({}, true)

const plugins = [
  new HtmlWebpackPlugin(),
  new HtmlPlugin(),
]
```

## node api
```js
const {
  core,
  CssTransformer,
  TsTransformer,
  HtmlTransformer,
} = require('extra-source-replace-tool')
core.config({}, true)

new TsTransformer({ code: someCode })
  .transformAsync()
  .then(newCode => {})
```
