const path = require('path')
const TsTransformer = require('../core/ts-transformer')
const core = require('../core')

module.exports = function (source, map) {
  const { options } = core
  const req = this.currentRequest.split('!')
  const file = req[req.length - 1]
  if (options.ignorePath && options.ignorePath.test(file)) return source

  const realSource = map && map.sourcesContent && map.sourcesContent.length > 0 ? map.sourcesContent[0].trim() : source
  const leadingComment = /^\/\/.*|^\/\*[\s\S]+?\*\//.exec(realSource)
  if (leadingComment && /@local-ignore/.test(leadingComment[0])) return source

  new TsTransformer(path.relative(options.context, file), source, options)
    .getTransformCode()
    .then(transformedCode => {
      this.callback(null, source)
    })
    .catch(e => {
      this.callback(e, null)
    })
}