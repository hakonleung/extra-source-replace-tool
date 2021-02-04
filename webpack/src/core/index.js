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
  ],
  transformCgi: null,
  blockExtraUrl: true,
  blockPaths: ['/txdoc/getauthinfo', '/info/report'],
  blockIntraUrl: false,
  l1PathMap: {
    doc: '/cgi-bin/doc',
    wedoc: '/cgi-bin/doc',
    txdoc: '/cgi-bin/doc',
    comment: '/cgi-bin/doc',
    disk: '/cgi-bin/disk'
  },
  l2PathMap: {
    getinfo: 'get_info'
  }
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