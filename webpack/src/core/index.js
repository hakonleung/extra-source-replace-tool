const DEFAULT_OPTIONS = {
  protocol: 'https',
  ignorePath: '',
  context: process.cwd(),
  global: 'window',
  globalAlias: ['windowAsAny', 'global'],
  origins: ['https://doc.weixin.qq.com'],
  validBinaryAccesses: [
    ['window', 'location'],
    ['window', 'location', 'href'],
  ],
  validCallAccesses: [
    ['window', 'open'],
    ['window', 'location', 'replace'],
  ]
}
const core = {}

let _options = DEFAULT_OPTIONS
Object.defineProperty(core, 'options', {
  get() {
    return _options
  },
  set(opts) {
    _options = {
      ...DEFAULT_OPTIONS,
      ...opts
    }
  }
})

module.exports = core