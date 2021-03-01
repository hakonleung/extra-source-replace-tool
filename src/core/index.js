const DEFAULT_OPTIONS = {
  protocol: 'https',
  ignorePath: '',
  context: process.cwd(),
  global: 'window',
  globalAlias: ['windowAsAny', 'global'],
  origins: [],
  matchBinaryAccesses: [
    ['window', 'location'],
    ['window', 'location', 'href'],
  ],
  matchCallAccesses: [
    ['window', 'open'],
    ['window', 'location', 'replace'],
  ],
  ignoreBinaryAccesses: [],
  ignoreCallAccesses: [],
  transformCgi: null,
  blockExtraUrl: false,
  blockPaths: [],
  blockIntraUrl: false,
  l1PathMap: {},
  l2PathMap: {},
  injectBlockMethod: false,
  requestTimeout: 3000,
  requestRetryTimes: 3
}

const DEFAULT_OPTION_MAP = {
  WEFE: {
    origins: ['https://doc.weixin.qq.com'],
    // blockPaths: ['/txdoc/getauthinfo', '/info/report'],
    l1PathMap: {
      doc: '/cgi-bin/doc',
      wedoc: '/cgi-bin/doc',
      txdoc: '/cgi-bin/doc',
      comment: '/cgi-bin/doc',
      disk: '/cgi-bin/disk',
      info: '/cgi-bin/disk',
    },
    l2PathMap: {
      getinfo: 'get_info'
    },
    injectBlockMethod: true,
    ignoreBinaryAccesses: [],
    ignoreCallAccesses: [
      ['tencentDocOpenUrl']
    ],
  }
}

const core = {
  options: DEFAULT_OPTIONS
}

core.config = (options, reset, type = 'WEFE') => {
  if (reset) {
    core.options = {
      ...DEFAULT_OPTIONS,
      ...(type && DEFAULT_OPTION_MAP[type] ? DEFAULT_OPTION_MAP[type] : {}),
    }
  }
  core.options = {
    ...core.options,
    ...options
  }
}

module.exports = core