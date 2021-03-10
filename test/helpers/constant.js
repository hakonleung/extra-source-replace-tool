const path = require('path')
const ROOT = process.cwd()

module.exports = {
  ROOT,
  OUTPUT_PATH: path.resolve(ROOT, './test'),
  FIXTURES_PATH: path.resolve(ROOT, './test/fixtures'),
}
