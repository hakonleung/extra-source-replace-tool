const TsTransform = require('../utils/ts-ast')
const config = require('../core/config')

module.exports = function (source, map) {
  const req = this.currentRequest.split('!')
  const file = req[req.length - 1]
  if (config.ignorePath && config.ignorePath.test(file)) return source

  const realSource = map && map.sourcesContent && map.sourcesContent.length > 0 ? map.sourcesContent[0].trim() : source
  const leadingComment = /^\/\/.*|^\/\*[\s\S]+?\*\//.exec(realSource)
  if (leadingComment && /@local-ignore/.test(leadingComment[0])) return source

  try {
    let transformedCode, changeset
    // .js .jsx .ts .tsx
    const transformer = new TsTransform(path.relative(config.context, file), source, config)
  
    transformedCode = transformer.transformedCode
    changeset = transformer.changeset
    

    if (changeset.length === 0) transformedCode = source

    return transformedCode
  } catch(e) {
    this.callback(e, null);
  }
}