const postcss = require('postcss')
const loaderUtils = require('loader-utils')
const { getParseBase64Promise } = require('../../utils/http')
const logger = require('../../utils/logger')
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
        values.forEach((v, i) => {
          if (!v) return
          const newCode = transformList[i].node.value.replace(transformList[i].origin, v)
          logger.info('css', `from: ${transformList[i].node.value.slice(0, 66)}...`, `to: ${newCode.slice(0, 66)}...`)
          transformList[i].node.value = newCode
        })

        const result = postcss().process(this.root, this.loader && loaderUtils.getOptions(this.loader) || undefined)

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