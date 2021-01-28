// If your plugin is direct dependent to the html webpack plugin:
const HtmlWebpackPlugin = require('html-webpack-plugin')
// If your plugin is using html-webpack-plugin as an optional dependency
// you can use https://github.com/tallesl/node-safe-require instead:
// const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin')
const htmlparser2 = require('htmlparser2')
const domSerializer = require('dom-serializer')
const domHandler = require('domhandler')

const {
  urlStyleTestReg,
  urlExtractReg,
  getParseBase64Promise
} = require('./utils')

const dfs = (node, handler) => {
  const stack = [node]
  while (stack.length) {
    const cur = stack.pop()
    typeof handler === 'function' && handler(cur)
    stack.push(...(cur.children || []).map(v => v))
  }
}

const traversal = (root) => {
  const shouldTransformNodes = []
  const hanler = (node) => {
    let text
    switch (node.name) {
      case 'link':
        if (urlExtractReg.test(node.attribs.href)) {
          shouldTransformNodes.push({
            node,
            attr: 'href'
          })
        }
        return
      case 'style':
        if (urlStyleTestReg.test(node.attribs.src)) {
          shouldTransformNodes.push({
            node,
            attr: 'src'
          })
        }
        return
      case 'script':
        text = node.children.reduce((r, v) => r + v.data, '')
        if (urlExtractReg.test(text)) {
          node.children = []
          shouldTransformNodes.push({
            node,
            text,
          })
        }
      // case 'iframe':
      case 'source':
      case 'img':
        if (urlExtractReg.test(node.attribs.src)) {
          shouldTransformNodes.push({
            node,
            attr: 'src'
          })
        }
        return
    }

    if (node.attribs && node.attribs.style) {
      if (urlExtractReg.test(node.attribs.style)) {
        shouldTransformNodes.push({
          node,
          attr: 'style'
        })
      }
    }
  }
  dfs(root, hanler)
  return shouldTransformNodes
}

const genPromisesFromNodes = (nodes) => nodes.reduce((promises, node) => [...promises, new Promise((resolve, reject) => {
  if (node.attr) {

  } else {

  }
})], [])

class HtmlLinkTransformPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('HtmlLinkTransformPlugin', (compilation) => {
      console.log('The compiler is starting a new compilation...')

      // Static Plugin interface |compilation |HOOK NAME | register listener 
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'HtmlLinkTransformPlugin',
        (data, cb) => {
          const root = htmlparser2.parseDocument(data.html)
          const shouldTransformNodes = traversal(root)
          debugger
          let str = domSerializer.default(root)
          // cb(null, data)
        }
      )
    })
  }
}

module.exports = HtmlLinkTransformPlugin