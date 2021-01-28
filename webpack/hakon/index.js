// If your plugin is direct dependent to the html webpack plugin:
const HtmlWebpackPlugin = require('html-webpack-plugin')
// If your plugin is using html-webpack-plugin as an optional dependency
// you can use https://github.com/tallesl/node-safe-require instead:
// const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin')
const htmlparser2 = require('htmlparser2')
const domSerializer = require('dom-serializer')
const domHandler = require('domhandler')
const config = require('./config')

const {
  urlStyleTestReg,
  urlExtractReg,
  getParseBase64Promise,
  getParseJsPromise
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
      case 'script':
        text = node.children.reduce((r, v) => r + v.data, '')
        if (urlExtractReg.test(text)) {
          node.children = []
          shouldTransformNodes.push({
            node,
            text,
          })
          return
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
      if (urlStyleTestReg.test(node.attribs.style)) {
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

const genPromise = (item) => {
  const { attr, node, text } = item
  if (attr === 'style') {
    const reg = new RegExp(urlStyleTestReg, 'g')
    const extractResult = []
    let temp
    while (temp = reg.exec(node.attribs[attr])) {
      extractResult.push(temp.groups)
    }
    return Promise
      .all(extractResult.map(({ url }) => getParseBase64Promise(url)))
      .then(res => res.forEach((v, i) => v && (node.attribs[attr] = node.attribs[attr].replace(extractResult[i].origin, v))))
  } else if (attr) {
    if (attr === 'src' && node.name === 'script') {
      return getParseJsPromise(node.attribs[attr]).then(v => {
        delete node.attribs[attr]
        const textNode = new domHandler.Text(v)
        node.children = [textNode]
      })
    } else {
      return getParseBase64Promise(node.attribs[attr]).then(v => v && (node.attribs[attr] = v))
    }
  } else {
    const reg = new RegExp(urlExtractReg, 'g')
    const extractResult = []
    let temp
    while (temp = reg.exec(text)) {
      extractResult.push(temp.groups)
    }
    return Promise
      .all(extractResult.map(({ href }) => getParseBase64Promise(href)))
      .then(res => {
        let newText = text
        res.forEach((v, i) => {
          if (v) {
            newText = newText.replace(extractResult[i].href, v)
          }
        })
        const textNode = new domHandler.Text(newText)
        node.children = [textNode]
      })
  }
}

class HtmlLinkTransformPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('HtmlLinkTransformPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'HtmlLinkTransformPlugin',
        (data, cb) => {
          const root = htmlparser2.parseDocument(data.html)
          const items = traversal(root).map(item => genPromise(item))
          Promise.all(items).then(res => {
            data.html = domSerializer.default(root)
            cb(null, data)
          }).catch(err => {
            console.log(err)
            process.exit(1)
          })
        }
      )
    })
  }
}

module.exports = HtmlLinkTransformPlugin

module.exports.config = config