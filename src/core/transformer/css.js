const postcss = require('postcss')
const { getParseBase64Promise } = require('../../utils/http')
const { parseStyleUrl } = require('../../utils/url-parser')
const Transformer = require('.')

class CssTransformer extends Transformer {
  init() {
    if (this.meta && this.meta.ast && this.meta.ast.type === 'postcss' && this.meta.ast.root) {
      this.root = this.meta.ast.root
    } else {
      this.root = postcss.parse(this.code, { from: this.filename, map: this.map })
    }
  }

  transformAsync() {
    const transformList = []
    this.root.walkDecls((node) => {
      // todo: consider multiple url
      const res = parseStyleUrl(node.value, true)
      if (!res) return
      transformList.push({
        node,
        href: res.href,
        origin: res.origin,
      })
    })

    return Promise.all(transformList.map(({ href }) => getParseBase64Promise(href, this.core))).then((values) => {
      values.forEach((v, i) => {
        if (!v) return
        const newCode = transformList[i].node.value.replace(transformList[i].origin, v)
        this.log({
          code: transformList[i].node.value,
          transformed: newCode,
        })
        transformList[i].node.value = newCode
      })
      const result = this.root.toResult({ map: { prev: this.map, inline: false } })
      result.meta = {
        ast: {
          type: 'postcss',
          version: result.processor.version,
          root: result.root,
        },
      }
      return result
    })
  }
}

module.exports = CssTransformer
