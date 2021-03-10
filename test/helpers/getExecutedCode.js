const execute = require('test/helpers/execute')
const readAsset = require('test/helpers/readAsset')

module.exports = (asset, compiler, stats) => {
  let executed = execute(readAsset(asset, compiler, stats))

  if (Array.isArray(executed)) {
    executed = executed.map((module) => {
      // eslint-disable-next-line no-param-reassign
      module[0] = module[0].replace(/\?.*!/g, '?[ident]!')

      return module
    })
  }

  return executed
}
