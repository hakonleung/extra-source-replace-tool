const postcss = require('postcss')
const loaderUtils = require('loader-utils')
const { getParseBase64Promise } = require('../../utils/http')
const { parseStyleUrl } = require('../../utils/url-parser')
const Transformer = require('.')

class CssTransformer extends Transformer {
  init() {
    if (this.meta && this.meta.ast && this.meta.ast.type === 'postcss' && this.meta.ast.root) {
      this.root = this.meta.ast.root
    } else {
      this.root = postcss.parse(this.code)
    }
  }

  transformAsync() {
    const transformList = []
    this.root.walkDecls(node => {
      const res = parseStyleUrl(node.value, true)
      if (!res) return
      transformList.push({
        node,
        href: res.href,
        origin: res.origin
      })
    })

    return Promise
      .all(transformList.map(({ href }) => getParseBase64Promise(href)))
      .then((values) => {
        values.forEach((v, i) => v && (transformList[i].node.value = transformList[i].node.value.replace(transformList[i].origin, v)))

        const result = postcss().process(this.root, this.loader && loaderUtils.getOptions(this.loader))

        result.meta = {
          ast: {
            type: "postcss",
            version: result.processor.version,
            root: result.root
          }
        }

        return result
      })
  }
}

module.exports = CssTransformer