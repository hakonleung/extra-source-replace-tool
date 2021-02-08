const postcss = require('postcss')
const loaderUtils = require('loader-utils')
const { getParseBase64Promise } = require('../../utils/http')
const { parseStyleUrl } = require('../../utils/url-parser')
const { isIgnoreFile } = require('../../utils/ast')
const Transformer = require('.')

class CssTransformer extends Transformer {
  init() {
    if (this.meta && this.meta.ast && this.meta.ast.type === 'postcss' && this.meta.ast.root) {
      this.root = this.meta.ast.root
    } else {
      this.root = postcss.parse(this.code)
    }
  }

  async transform() {
    const transformList = []
    this.root.walkDecls(node => {
      const res = parseStyleUrl(node.value, true)
      if (!res) return
      transformList.push({
        node,
        url: res.url,
        origin: res.origin
      })
    })

    return Promise
      .all(transformList.map(({ url }) => getParseBase64Promise(url)))
      .then((values) => {
        values.forEach((v, i) => v && (transformList[i].node.value = transformList[i].node.value.replace(transformList[i].origin, v)))

        const options = loaderUtils.getOptions(this.loader)
        const processOptions = { prev: this.sourceMap }

        if (typeof options.sourceMap !== "undefined" ? options.sourceMap : this.sourceMap) {
          processOptions.map = {
            inline: false,
            annotation: false,
            ...processOptions.map
          }
        }

        const result = postcss().process(this.root, processOptions)

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