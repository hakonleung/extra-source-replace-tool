const postcss = require('postcss')
const loaderUtils = require('loader-utils')

const {
  urlStyleTestReg,
  urlExtractReg,
  getParseBase64Promise
} = require('./utils')

module.exports = function (content, sourceMap, meta) {
  this.cacheable && this.cacheable(false)
  const callback = this.async()

  const root = meta && meta.ast && meta.ast.type === "postcss" ? meta.ast.root : postcss.parse(content)
  const matchList = []
  root.walkDecls(decl => {
    const res = urlStyleTestReg.exec(decl.value)
    if (!res || !urlExtractReg.exec(res.groups.url)) return
    matchList.push({
      decl,
      url: res.groups.url,
      origin: res.groups.origin
    })
  })

  Promise
    .all(matchList.reduce((all, { url }) => ([...all, getParseBase64Promise(url)]), []))
    .then((values) => {
      values.forEach((v, i) => matchList[i].decl.value = matchList[i].decl.value.replace(matchList[i].origin, v))

      const options = loaderUtils.getOptions(this)
      const processOptions = { prev: sourceMap }

      if (typeof options.sourceMap !== "undefined" ? options.sourceMap : this.sourceMap) {
        processOptions.map = {
          inline: false,
          annotation: false,
          ...processOptions.map
        }
      }

      const result = postcss().process(root, processOptions)

      const ast = {
        type: "postcss",
        version: result.processor.version,
        root: result.root
      }

      callback(
        null,
        result.css,
        result.map ? result.map.toJSON() : undefined,
        { ast }
      )
    }).catch((err) => {
      console.error(err)
      process.exit(1)
    })
}