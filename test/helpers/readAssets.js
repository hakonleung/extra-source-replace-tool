const readAsset = require('test/helpers/readAsset')

module.exports = (compiler, stats) =>
  Object.keys(stats.compilation.assets).reduce(
    (assets, asset) => Object.assign(assets, { asset: readAsset(asset, compiler, stats) }),
    {}
  )
