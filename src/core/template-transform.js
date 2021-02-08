const htmlparser2 = require('htmlparser2')
const domSerializer = require('dom-serializer')
const domHandler = require('domhandler')
const {
  getParseBase64Promise,
  getParseJsPromise
} = require('../utils/http')
const {
  testUrl,
  parseStyleUrl,
  execUrl,
  execStyleUrl
} = require('../utils/url-parser')
const TsTransformer = require('./transformer/ts')

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
    switch (node.name) {
      case 'link':
        if (testUrl(node.attribs.href)) shouldTransformNodes.push({ node, attr: 'href' })
        return
      case 'style':
      case 'script':
        const text = node.children.reduce((r, v) => r + v.data, '')
        if (testUrl(text)) {
          node.children = []
          shouldTransformNodes.push({ node, text })
          return
        }
      // case 'iframe':
      case 'source':
      case 'img':
        if (testUrl(node.attribs.src)) shouldTransformNodes.push({ node, attr: 'src' })
        return
    }

    if (node.attribs && node.attribs.style && parseStyleUrl(node.attribs.style, true)) shouldTransformNodes.push({ node, attr: 'style' })
  }
  dfs(root, hanler)
  return shouldTransformNodes
}

const genPromise = (item) => {
  const { attr, node, text } = item
  if (attr === 'style') {
    // style attr
    const extractResult = execStyleUrl(node.attribs[attr], true)
    return Promise
      .all(extractResult.map(({ href }) => getParseBase64Promise(href)))
      .then(res => res.forEach((v, i) => v && (node.attribs[attr] = node.attribs[attr].replace(extractResult[i].origin, v))))
  } else if (attr) {
    if (attr === 'src' && node.name === 'script') {
      // js src
      return getParseJsPromise(node.attribs[attr]).then(v => {
        delete node.attribs[attr]
        const textNode = new domHandler.Text(v)
        node.children = [textNode]
      })
    } else {
      // other link
      return getParseBase64Promise(node.attribs[attr]).then(v => v && (node.attribs[attr] = v))
    }
  } else {
    if (node.name === 'script') {
      // js content
      return new TsTransformer({ code: text })
        .transformAsync()
        .then(transformedCode => {
          // debugger
          const textNode = new domHandler.Text(transformedCode)
          node.children = [textNode]
        })
    }
    // css
    const extractResult = execUrl(text)
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

function templateTransform(html) {
  try {
    const root = htmlparser2.parseDocument(html)
    const items = traversal(root).map(item => genPromise(item))
    return Promise.all(items)
      .then(() => domSerializer.default(root))
      .catch(err => {
        console.log(err)
      })
  } catch (err) {
    console.error(err)
  }
  return Promise.resolve(html)
}

module.exports = templateTransform
