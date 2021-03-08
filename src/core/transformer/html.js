const htmlparser2 = require('htmlparser2')
const domSerializer = require('dom-serializer')
const domHandler = require('domhandler')
const { getParseBase64Promise, getParseJsPromise } = require('../../utils/http')
const { testUrl, parseStyleUrl, execStyleUrl } = require('../../utils/url-parser')
const Transformer = require('.')
const TsTransformer = require('./ts')
const CssTransformer = require('./css')
const fs = require('fs')
const path = require('path')

const addNode = (node, parent, type = 'prepend') => {
  // type append prepend reset
  if (type === 'reset') {
    parent.children = [node]
  } else if (type === 'prepend') {
    const nextSibling = parent.children[0]
    parent.children.unshift(node)
    if (nextSibling) {
      node.next = nextSibling
      nextSibling.prev = node
    }
  } else if (type === 'append') {
    const previousSibling = parent.children[parent.children.length - 1]
    parent.children.push(node)
    if (previousSibling) {
      node.prev = previousSibling
      previousSibling.next = node
    }
  }
  node.parent = parent
}

class HtmlTransformer extends Transformer {
  static getInjectJs(instance = { log: () => {}, options: {} }) {
    if (!instance.options.injectBlockMethod) return null
    if (!HtmlTransformer.injectJsCache) {
      try {
        const file = fs.readFileSync(path.resolve(__dirname, '../../inject/inject.production.js'), 'utf-8')
        HtmlTransformer.injectJsCache = file.replace(
          '__OPTIONS__',
          JSON.stringify(instance.options).replace(/"/g, '\\"')
        )
        instance.log({
          info: 'inject success!',
        })
      } catch (error) {
        instance.log(
          {
            error,
            info: 'inject error!',
          },
          'error'
        )
      }
    }
    return HtmlTransformer.injectJsCache || null
  }

  injectJs(head) {
    const js = HtmlTransformer.getInjectJs(this)
    if (!js) return
    if (!head) {
      head = new domHandler.Element('head')
      addNode(head, this.root)
    }
    addNode(new domHandler.Element('script', {}, [new domHandler.Text(js)]), head)
  }

  init() {
    this.root = htmlparser2.parseDocument(this.code)
  }

  dfs(node, handler) {
    const stack = [node]
    while (stack.length) {
      const cur = stack.pop()
      typeof handler === 'function' && handler(cur)
      stack.push(...(cur.children || []).map((v) => v))
    }
  }

  traverse() {
    let head = null
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
        case 'head':
          head = node
          return
      }

      if (node.attribs && node.attribs.style && parseStyleUrl(node.attribs.style, true))
        shouldTransformNodes.push({ node, attr: 'style' })
    }
    this.dfs(this.root, hanler)
    this.injectJs(head)
    return shouldTransformNodes
  }

  genPromise(item) {
    const { attr, node, text } = item
    if (attr === 'style') {
      // style attr
      const extractResult = execStyleUrl(node.attribs[attr], true)
      return Promise.all(extractResult.map(({ href }) => getParseBase64Promise(href, this.options, this.logger))).then(
        (res) =>
          res.forEach((v, i) => {
            if (!v) return
            const newCode = node.attribs[attr].replace(extractResult[i].origin, v)
            this.log({
              from: 'tag attr style',
              code: node.attribs[attr],
              transformed: newCode,
            })
            node.attribs[attr] = newCode
          })
      )
    } else if (attr) {
      if (attr === 'src' && node.name === 'script') {
        // js src
        return getParseJsPromise(node.attribs[attr], this.options, this.logger).then((v) => {
          if (!v) return
          this.log({
            from: 'script attr src',
            to: 'script innerText',
            code: node.attribs[attr],
            transformed: v,
          })
          const textNode = new domHandler.Text(v)
          node.children = [textNode]
          delete node.attribs[attr]
        })
      } else {
        // other link
        return getParseBase64Promise(node.attribs[attr], this.options, this.logger).then((v) => {
          if (!v) return
          this.log({
            from: 'tag attr href',
            code: node.attribs[attr],
            transformed: v,
          })
          node.attribs[attr] = v
        })
      }
    } else {
      const transformer = node.name === 'script' ? TsTransformer : CssTransformer
      return new transformer({ code: text, parent: this.filename }, this.options, this.logger)
        .transformAsync()
        .then((res) => {
          const newTextNode = new domHandler.Text(node.name === 'script' ? res : res.css)
          addNode(newTextNode, node, 'reset')
        })
    }
  }

  transformAsync() {
    const items = this.traverse().map((item) => this.genPromise(item))
    return Promise.all(items)
      .then(() => domSerializer.default(this.root))
      .catch((error) => {
        this.log({
          error,
        })
      })
  }
}

module.exports = HtmlTransformer
