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

## ESRTCore
generate transformer config and provide log function
```js
const { ESRTCore } = require('extra-source-replace-tool/src')

const options = { injectBlockMethod: true }

ESRTCore.getInstance(options, /* optional options type*/'WEFE') // generate or get singleton instance, with logger and options { ...defaultOptions, ...WEFEOptions, ...options }

ESRTCore.getInstance().configure(options, /* reset options to default */ true, 'WEFE')

ESRTCore.genOptions(options, 'WEFE') // generate new options

new ESRTCore(options, 'WEFE') // generate new core, generally using to isolate for singleton instance
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



接手微文档本地化的需求有一段时间了，本地化（本地部署）通常在已有项目上进行，意味着源码的外域资源需要转化为内域资源（图片、脚本等），请求接口需要迁移（路径可能变化），外域接口如果没有迁移至本地服务器的则需要屏蔽，原有的内域链接由于带上了域名，也需要替换成相对链接。上述改动属于比较基础的改动，影响范围比较大且易遗漏，合代码后还要检查有没有新增的资源或接口，操作起来机械重复，考虑到后续还有其他项目要迁移，一个自动化处理的工具势在必行。

最开始写了一个请求方法的代理（xhr、window.open），接口请求链接不需要改动，把代理引入项目进行统一处理即可，运行时的处理有两个问题，外域资源仍无法解决，electron等应用内可能因为客户端重写方法导致代理失效（window.open）。还是在构建阶段处理好省心。

请求类型可以分为三种：
1、静态资源（path带后缀）
2、cgi
3、url重定向（可以和cgi一样处理）

链接转化规则：
1、外域静态资源，先下载，然后转base64或者放在打包产物内，维护资源路径并替换请求接口
2、内域cgi映射到迁移后的cgi，外域cgi不处理，或者置空
3、重定向的处理同 2

如何找到需要替换的链接呢？观察源码后总结了各种文件的规则：
1、css文件，声明的值匹配 /url\((['"]?)[^'" ]+\1)\)/i，按照静态资源处理

2、/(t|j)sx?/文件，按照优先级从高到低
2.1、等号表达式和函数调用，提取左侧或函数名的路径校验（可能会直接跳过后代节点），可能需要转化的，递归处理右侧或首参（通常情况是首参），按照cgi处理
2.2、二进制表达式（判断是否是字符串拼接），非字符串拼接的，递归处理后代str，是字符串拼接的，合并成 字符串 + 非str... 的结构，把首个参与运算的节点交给 2.4 处理
2.3、属于str的，根据上下文判断，如果是jsx属性值或者监测到文本可能是css，按照css的匹配规则处理，如果是完整链接（后续没有其他拼接内容），按照cgi或静态资源处理，如果是不完整链接，按照cgi处理（因为非运行时拿到不完整链接去请求的资源可能是错误的，且base64替换回来也会有问题）

3、html等模版文件
3.1、link、style等标签的href、src类属性，按照静态资源处理后替换回属性值
3.2、script标签的src，获取静态资源后将js textNode插入节点
3.3、style属性，按照css匹配规则处理
3.4、script标签的textNode，经过 2 转化后替换原内容
3.5、记录head节点，可能会注入代理逻辑，没有head的插入一个

工具结构：
- HtmlPlugin
  - HtmlTransformer
    - TsTransformer
    - CssTransformer
    - Injector

- tsLoader
  - TsTransformer
    - TsProcessor

- cssLoader
  - CssTransformer

- ESRTCore 用户配置和log
  - Logger
  - options

- Changeset 记录需要变更的节点和匹配的 url 信息


plugin和loader的主要逻辑是根据ESRTCore全局实例和上下文信息实例Transformer，取得代码后callback
```js
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
          .then(() => this.core.logger.writeDataToJson())
          .catch((e) => cb(e))
      )
    })
  }
}
```

Transformer基类初始化数据，提供log方法

CssTransformer
1、使用meta缓存的ast，或 postcss.parse 生成ast
2、遍历样式声明，收集待转化节点
```js
this.root.walkDecls((node) => {
  // todo: support multiple url
  const res = parseStyleUrl(node.value, true)
  if (!res) return
  transformList.push({
    node,
    href: res.href,
    origin: res.origin,
  })
})
```
3、通过Fetcher获取资源，替换待转化节点的值，重新生成css和sourceMap
```js
this.root.toResult({ map: { prev: this.map, inline: false } })
```

TsProcessor 接收ast，收集脚本代码待转化节点
1、使用 ts compiler api

traverse 遍历入口，返回ts.transform生成的新语法树
```js
const nodeVisitor = (node) => {
  // 忽略文件
  if (isIgnoreNode(node, this.sourceFile)) return node
  // 记录jsx上下文
  if (!this.jsxAttribute && ts.isJsxAttribute(node)) this.jsxAttribute = node
  let res
  // [this.traverseExpression, this.traverseStringPlus, this.traverseString]
  this.traverseFuncs.some((f) => (res = f.call(this, node, changeset)))
  // 条件遍历函数有返回值的，使用返回值
  if (res) {
    // 忽略后代，直接返回
    if (res.ignore) return node
    // 返回新生成的节点
    return res.node
  }
  // 递归
  res = ts.visitEachChild(node, nodeVisitor, context)
  if (this.jsxAttribute === node) this.jsxAttribute = null
  return res
}
```

traverseExpression 处理等号表达式和函数调用
```js
// 获取变量路径
const access = getAccess(expr[accessEntry])
// 需要忽略的路径
if (isIgnoreAccess(access, isCallExpression, this.options)) return { ignore: true }
// 不是需要特殊处理的路径，直接返回让后续的条件遍历函数处理
if (!isMatchAccess(access, isCallExpression, this.options)) return
// 获取首参或右表达式
const child = expr[argsEntry] instanceof Array ? expr[argsEntry][0] : expr[argsEntry]
if (!child) return
let childChangeset = new Changeset(this.sourceFile)
// 递归 child，生成后代节点和changeset
let childRes = this.traverse(child, childChangeset)

if (childRes) {
  // 替换节点
  if (expr[argsEntry] instanceof Array) {
    expr[argsEntry][0] = childRes.node
  } else {
    expr[argsEntry] = childRes.node
  }
  changeset.add({ node: expr, access, child: childChangeset })
  return { node: expr, changeset }
}
```

traverseStringPlus 处理字符串拼接
```js
const handler = (node) => {
  // 后代不是字符串拼接，交给入口处理
  if (!isStringPlusExp(node)) return this.traverse(node, changeset).node
  if (
    (ts.isStringLiteral(node.left) || ts.isNoSubstitutionTemplateLiteral(node.left)) &&
    (ts.isStringLiteral(node.right) || ts.isNoSubstitutionTemplateLiteral(node.right))
  ) {
    // 直接合并的情况
    const textNode = new ts.createStringLiteral(node.left.text + node.right.text)
    textNode.parent = node.parent
    textNode.pos = node.left.pos
    textNode.end = node.right.end
    // 交给 traverseString 处理字符串
    this.traverseString(textNode, changeset)
    // 返回新节点
    return textNode
  } else if (
    ts.isStringLiteral(node.left) ||
    ts.isNoSubstitutionTemplateLiteral(node.left) ||
    ts.isTemplateExpression(node.left)
  ) {
    // 不能合并的，只处理左表达式，匹配 url 一定是从起始字符开始的，其他位置有函数调用、引用等情况，就不用考虑了
    this.traverseString(node.left, changeset)
    return node
  }
}
const nodeVisitor = (node) => {
  // 合并一波
  let newNode = handler(node)
  if (newNode) return newNode
  // 递归处理 'a' + 'b' + 'c' 的情况，初始 left 是 'a' + 'b'，合并后代
  newNode = ts.visitEachChild(node, nodeVisitor, context)
  // 后代合并完，最后再合并一次 'ab' + 'c'
  return handler(newNode) || newNode
}
```

traverseString 处理各种字符串
```js
if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
  // 纯文本
  text = expr.text
  if (
    (this.jsxAttribute && this.jsxAttribute.name.text === 'style' && ts.isPropertyAssignment(expr.parent)) ||
    cssDetect(text)
  ) {
    // 监测到可能是样式文本
    const locations = execStyleUrl(text, true)
    if (!locations.length) return
    cs = { node: expr, text, locations }
  }
} else if (ts.isTemplateExpression(expr)) {
  // 模版字符串提取head
  text = expr.head.text
  incomplete = true
} else {
  return
}
if (!cs && text && (location = getUrlFullInfo(text, incomplete, this.options))) {
  cs = { node: expr, text, location }
}
if (cs) {
  changeset.add(cs)
}
```

TsTransformer 生成sourceFile，实例TsProcessor得到changetset后做资源替换