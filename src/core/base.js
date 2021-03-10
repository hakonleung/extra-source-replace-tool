const DEFAULT_OPTIONS = {
  context: process.cwd(), // root path, used to generate relative filepath

  extraBlock: false, // whether transform extra path to empty string

  globalAlias: ['window', 'windowAsAny', 'global'], // default top level object

  injectBlockMethod: false, // whether inject method which proxy ajax and window.open to document`s head tag

  intraBlock: false, // whether transform intra path which is not in intraPathTopLevelRules to empty string
  intraBlockPaths: [], // intra path which is always transformed to empty string
  intraHosts: [], // hosts regarded as intra host
  intraPathSecondLevelRules: {}, // second level intra path transformed rules
  intraPathTopLevelRules: {}, // top level intra path transformed rules, for example, { test: 'testcgi' } means '/test/a' should be transformed to '/testcgi/a'
  intraProtocol: 'https', // default protocol

  loggerCodeLength: 100, // intercept log code
  loggerDataToJson: true, // save structured log info to json file
  loggerTransports: ['file'], // logger transports, optional config are file and console

  requestRetryTimes: 3, // fetch retry times
  requestTimeout: 3000, // fetch timeout

  transformCgi: null, // method which transform intra cgi

  transformerCgiEqualExprAccesses: ['window.location', 'window.location.href'], // expr.right regarded as cgi url, for example, 'window.location.href = 'xxx'' means xxx regarded as cgi url
  transformerCgiCallExprAccesses: ['window.open', 'window.location.replace'], // expr.arguments[0] regarded as cgi url
  transformerIgnoreEqualExprAccesses: [], // ignore binary expression with equal operation
  transformerIgnoreCallExprAccesses: [],
  transformerIgnorePathReg: null, // regexp used to ignore filepath
}

const DEFAULT_OPTION_MAP = {
  WEFE: {
    // intraBlockPaths: ['/txdoc/getauthinfo', '/info/report'],

    transformerIgnoreCallExprAccesses: ['tencentDocOpenUrl'],
    injectBlockMethod: true,

    intraPathTopLevelRules: {
      doc: '/cgi-bin/doc',
      wedoc: '/cgi-bin/doc',
      txdoc: '/cgi-bin/doc',
      comment: '/cgi-bin/doc',
      disk: '/cgi-bin/disk',
      info: '/cgi-bin/disk',
    },
    intraPathSecondLevelRules: {
      getinfo: 'get_info',
    },

    intraHosts: ['doc.weixin.qq.com'],
  },
  TEST1: {
    transformerIgnoreCallExprAccesses: ['tencentDocOpenUrl'],
    injectBlockMethod: true,

    intraPathTopLevelRules: {
      doc: '/cgi-bin/doc',
      wedoc: '/cgi-bin/doc',
      txdoc: '/cgi-bin/doc',
      comment: '/cgi-bin/doc',
      disk: '/cgi-bin/disk',
      info: '/cgi-bin/disk',
    },
    intraPathSecondLevelRules: {
      getinfo: 'get_info',
    },

    intraHosts: ['doc.weixin.qq.com'],
    loggerTransports: null,
    transformerIgnorePathReg: /ignore3/,
  },
  TEST2: {
    loggerTransports: null,
    intraHosts: ['test.com', 'test.cn'],
    intraPathTopLevelRules: {
      a: '/cgi-bin/b',
    },
    intraPathSecondLevelRules: {
      b: 'c',
    },
    injectBlockMethod: true,
    transformerIgnoreEqualExprAccesses: ['window.ignore.ignore', 'ignore.ignoreBlock'],
    transformerIgnoreCallExprAccesses: ['window.ignoreFunction'],
  },
}

class ESRTCore {
  static genOptions(options, type = 'WEFE') {
    return {
      ...DEFAULT_OPTIONS,
      ...(type && DEFAULT_OPTION_MAP[type] ? DEFAULT_OPTION_MAP[type] : {}),
      ...(typeof options === 'object' ? options : {}),
    }
  }

  static getInstance(options, type = 'WEFE') {
    return (ESRTCore.instance = ESRTCore.instance || new ESRTCore(options, type))
  }

  constructor(options, type = 'WEFE') {
    this.configure(options, true, type)
    this.initLogger()
  }

  configure(options, reset, type = 'WEFE') {
    if (reset) {
      this.options = {
        ...DEFAULT_OPTIONS,
        ...(type && DEFAULT_OPTION_MAP[type] ? DEFAULT_OPTION_MAP[type] : {}),
      }
    }
    this.options = {
      ...this.options,
      ...(typeof options === 'object' ? options : {}),
    }
    return this
  }

  initLogger() {
    if (ESRTCore.getLogger) {
      this.logger = ESRTCore.getLogger(this)
    }
  }
}

module.exports = ESRTCore
