(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const core = __webpack_require__(1)
const cssLoader = __webpack_require__(2)
const tsLoader = __webpack_require__(17)
const HtmlPlugin = __webpack_require__(21)
const CssTransformer = __webpack_require__(6)
const TsTransformer = __webpack_require__(18)
const HtmlTransformer = __webpack_require__(23)

module.exports = {
  core,
  cssLoader,
  tsLoader,
  HtmlPlugin,
  CssTransformer,
  TsTransformer,
  HtmlTransformer,
}

/***/ }),
/* 1 */
/***/ ((module) => {

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
  requestRetryTimes: 3,
  loggerTransports: ['file'],
  loggerCodeLength: 100,
  loggerDataToJson: true,
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
    ...(typeof options === 'object' ? options : {})
  }
}

module.exports = core

/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const factory = __webpack_require__(3)
const CssTransformer = __webpack_require__(6)

module.exports = factory(CssTransformer, {
  nocache: true
})


/***/ }),
/* 3 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { isIgnoreFile } = __webpack_require__(4)

module.exports = (Transformer, options = {}) => {
  return function (code, map, meta) {
    const filename = this.currentRequest.split('!').slice(-1)[0]
    if (isIgnoreFile(code, map, filename)) {
      return code
    }
    if (options.nocache && typeof this.cacheable === 'function') {
      this.cacheable(false)
    }
    const transformer = new Transformer({ code, map, meta, filename, loader: this })
    if (options.sync) {
      return transformer.transform()
    }
    const callback = this.async()
    transformer
      .transformAsync()
      .then((...res) => callback(null, ...res))
      .catch(e => callback(e))
  }
}

/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ts = __webpack_require__(5)
const core = __webpack_require__(1)

function stringPlusToTemplateExpression(exp) {
  const isStringPlusExp = node => ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken

  if (!isStringPlusExp(exp)) return
  let canTransform = true
  // 检查是否满足条件，并将节点变成数组
  const nodes = []
  function visit(node) {
    if (ts.isBinaryExpression(node)) {
      if (node.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
        canTransform = false
        return
      }

      ts.forEachChild(node, visit)
    } else if (ts.isStringLiteral(node)) {
      nodes.push(node)
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      nodes.push(node)
    } else if (node.kind !== ts.SyntaxKind.PlusToken) {
      nodes.push(node)
    }
  }

  ts.forEachChild(exp, visit)
  if (!canTransform || nodes.length < 2) return


  // 预处理：保证变量一定是字符串间隔的
  const combined = nodes.reduce((pre, cur) => {
    if (ts.isStringLiteral(cur)) {
      if (typeof pre[pre.length - 1] === 'string') {
        pre[pre.length - 1] += cur.text
      } else {
        pre.push(cur.text)
      }
    } else if (ts.isNoSubstitutionTemplateLiteral(cur)) {
      if (typeof pre[pre.length - 1] === 'string') {
        pre[pre.length - 1] += cur.rawText
      } else {
        pre.push(cur.text)
      }
    } else {
      if (typeof pre[pre.length - 1] === 'string') pre.push(cur)
      else pre.push('', cur)
    }

    return pre
  }, [''])

  if (typeof combined[combined.length - 1] !== 'string') combined.push('')
  if (combined.length === 1) return ts.createStringLiteral(combined[0])

  const head = ts.createTemplateHead(combined[0], combined[0])
  const tspan = []
  combined.forEach((node, index) => {
    if (index === 0) return

    if (typeof node !== 'string') {
      let tail;
      if (index + 1 === combined.length - 1) {
        tail = ts.createTemplateTail(combined[index + 1], combined[index + 1])
      } else {
        tail = ts.createTemplateMiddle(combined[index + 1], combined[index + 1])
      }
      tspan.push(ts.createTemplateSpan(node, tail))
    }
  })

  return ts.createTemplateExpression(head, tspan)
}

const matchAccess = (access, validAccesses) => {
  const { global, globalAlias } = core.options
  return access && access.length > 0 && validAccesses.some(validAccess => {
    let validStart = 0
    let accessStart = 0
    if (validAccess[0] === global) {
      validStart = 1
      if (access[0].text === global || globalAlias.includes(access[0].text)) {
        accessStart = 1
      }
    }
    const compareValidAccess = validAccess.slice(validStart)
    const compareAccess = access.slice(accessStart)
    return compareValidAccess.length === compareAccess.length && compareAccess.every((v, i) => v.text === compareValidAccess[i])
  })
}

const isMatchAccess = (access, isCallExpression) => {
  const { matchBinaryAccesses, matchCallAccesses } = core.options
  return matchAccess(access, isCallExpression ? matchCallAccesses : matchBinaryAccesses)
}

const isIgnoreAccess = (access, isCallExpression) => {
  const { ignoreBinaryAccesses, ignoreCallAccesses } = core.options
  return matchAccess(access, isCallExpression ? ignoreCallAccesses : ignoreBinaryAccesses)
}

const getAccess = (node) => {
  // get property access
  const access = []
  while (node) {
    // property && element access expression
    // only support identifier and string name
    if (ts.isIdentifier(node)) {
      access.unshift(node)
    } else if (node.name && ts.isIdentifier(node.name)) {
      access.unshift(node.name)
    } else if (node.argumentExpression) {
      if (ts.isStringLiteral(node.argumentExpression)) {
        access.unshift(node.argumentExpression)
      } else {
        // not support
        return []
      }
    }
    node = node.expression
  }
  return access
}

const isIgnoreFile = (source, map, filename) => {
  const { options } = core
  if (filename && options.ignorePath && options.ignorePath.test(filename)) return true
  const realSource = map && map.sourcesContent && map.sourcesContent.length > 0 ? map.sourcesContent[0].trim() : source
  const leadingComment = /^\/\/.*|^\/\*[\s\S]+?\*\//.exec(realSource)
  return leadingComment && /@local-ignore/.test(leadingComment[0])
}

const printNode = (node, sourceFile, hint = ts.EmitHint.Unspecified) => {
  return ts.createPrinter().printNode(hint, node, sourceFile)
}

module.exports = {
  stringPlusToTemplateExpression,
  isMatchAccess,
  isIgnoreAccess,
  getAccess,
  isIgnoreFile,
  printNode
}

/***/ }),
/* 5 */
/***/ ((module) => {

"use strict";
module.exports = require("typescript");;

/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const postcss = __webpack_require__(7)
const { getParseBase64Promise } = __webpack_require__(8)
const { parseStyleUrl } = __webpack_require__(11)
const Transformer = __webpack_require__(16)

class CssTransformer extends Transformer {
  init() {
    if (this.meta && this.meta.ast && this.meta.ast.type === 'postcss' && this.meta.ast.root) {
      this.root = this.meta.ast.root
    } else {
      this.root = postcss.parse(this.code, { from: this.filename, map: this.map })
    }
  }

  transformAsync() {
    const transformList = []
    this.root.walkDecls(node => {
      const res = parseStyleUrl(node.value, true)
      if (!res) return
      transformList.push({
        node,
        href: res.href,
        origin: res.origin
      })
    })

    return Promise
      .all(transformList.map(({ href }) => getParseBase64Promise(href)))
      .then((values) => {
        values.forEach((v, i) => {
          if (!v) return
          const newCode = transformList[i].node.value.replace(transformList[i].origin, v)
          this.log({
            code: transformList[i].node.value,
            transformed: newCode
          })
          transformList[i].node.value = newCode
        })
        const result = this.root.toResult({ map: { prev: this.map, inline: false } })
        result.meta = {
          ast: {
            type: "postcss",
            version: result.processor.version,
            root: result.root
          }
        }
        return result
      })
  }
}

module.exports = CssTransformer

/***/ }),
/* 7 */
/***/ ((module) => {

"use strict";
module.exports = require("postcss");;

/***/ }),
/* 8 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const http = __webpack_require__(9)
const https = __webpack_require__(10)
const { getUrlFullInfo } = __webpack_require__(11)
const core = __webpack_require__(1)
const logger = __webpack_require__(12)

const sourceCache = new Map()

const FETCH_PROTOCOL = {
  http,
  https
}

const isSupportExt = (ext) => {
  return ext && !/^(html?|exe|apk)$/i.test(ext)
}

const httpGet = (url, cb) => new Promise((resolve, reject) => {
  const fullInfo = getUrlFullInfo(url, false, core.options)
  if (!fullInfo || fullInfo.inside || !isSupportExt(fullInfo.ext) || !FETCH_PROTOCOL[fullInfo.protocol]) {
    return resolve()
  }
  let data = sourceCache.get(fullInfo.href)
  const onEnd = () => {
    typeof cb === 'function' && cb(data, { resolve, reject })
    resolve(data)
  }
  // use cache
  if (data) return onEnd()
  logger.info({
    type: fullInfo.protocol,
    code: url,
    transformed: fullInfo.href
  })
  let retryTimes = 0
  const getErrorCallback = (req) => (error) => {
    logger.error({
      type: fullInfo.protocol,
      error,
      info: `retryTimes: ${retryTimes}`
    })
    req && req.abort()
    if ((retryTimes += 1) <= core.options.requestRetryTimes) {
      fetch()
    } else {
      resolve()
    }
  }
  const fetch = () => {
    const req = FETCH_PROTOCOL[fullInfo.protocol].get(fullInfo.href, {
      timeout: core.options.requestTimeout
    }, (res) => {
      const chunks = []
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })
      res.on('end', (err) => {
        if (err) return onError(err)
        data = { res, chunks, size: chunks.reduce((sum, c) => sum + c.length, 0) }
        sourceCache.set(fullInfo.href, data)
        onEnd()
      })
    })
    req.on('timeout', () => req.abort())
    req.on('error', getErrorCallback(req))
  }

  fetch()
})

const getParseBase64Promise = (url) => httpGet(url, (data, promise) => {
  const { res, chunks, size } = data
  const { resolve } = promise
  resolve(`data:${res.headers['content-type']};base64,` + Buffer.concat(chunks, size).toString('base64'))
})

const getParseJsPromise = (url) => httpGet(url, (data, promise) => {
  const { chunks, size } = data
  const { resolve } = promise
  resolve(Buffer.concat(chunks, size).toString('utf8'))
})

module.exports = {
  getParseBase64Promise,
  getParseJsPromise
}

/***/ }),
/* 9 */
/***/ ((module) => {

"use strict";
module.exports = require("http");;

/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";
module.exports = require("https");;

/***/ }),
/* 11 */
/***/ ((module) => {

const URL_VALID_CHARS = `-_.~!*'();:@&=+$,/?#%`
const VALID_CHARS = {
  pathname: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[;:@&=+$,/?#'%]/g, '').split('').join('\\'),
  host: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[.;:@&=+$,/?#'%]/g, '').split('').join('\\'),
  hash: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[?#']/g, '').split('').join('\\'),
  search: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[?#']/g, '').split('').join('\\'),
}
const URL_REGS = {
  protocol: `(https?:)?\\/\\/`,
  pathname: `(^[${VALID_CHARS.pathname}]+)?((\\/[${VALID_CHARS.pathname}]+)+\\/?|\\/)`,
  host: `([${VALID_CHARS.host}])+(\\.[${VALID_CHARS.host}]+)+(\\:\\d+)?`,
  hash: `#[${VALID_CHARS.hash}]*`,
  search: `\\?[${VALID_CHARS.search}]*`
}
const _w = (name, group) => `(${group ? `?<${name}>` : ''}${URL_REGS[name]})`
Object.keys(URL_REGS).forEach(v => {
  URL_REGS[v + '_g'] = _w(v, true)
  URL_REGS[v] = _w(v)
})

const URL_ORIGIN_REG = `(?<origin>${URL_REGS.protocol_g}${URL_REGS.host_g})`
const URL_TAIL_REG = `(?<tail>${URL_REGS.pathname_g}?(${URL_REGS.hash_g}|${URL_REGS.search_g})?)`
const URL_REG = new RegExp(`${URL_ORIGIN_REG}?${URL_TAIL_REG}`, 'i')

const URL_ORIGIN_NO_GROUP = `(${URL_REGS.protocol}${URL_REGS.host})`
const URL_SEARCH_NO_GROUP = `(${URL_REGS.hash}|${URL_REGS.search})`
const URL_TAIL_NO_GROUP = `(${URL_REGS.pathname}${URL_SEARCH_NO_GROUP}?|${URL_SEARCH_NO_GROUP})`
const URL_REG_NO_GROUP = new RegExp(`(${URL_ORIGIN_NO_GROUP}${URL_TAIL_NO_GROUP}?)|(${URL_TAIL_NO_GROUP})`, 'i')
const URL_REG_NO_GROUP_ALL = new RegExp(`^${URL_REG_NO_GROUP.source}$`, URL_REG.flags)

const testUrl = (str, all) => str && (all ? URL_REG_NO_GROUP_ALL : URL_REG_NO_GROUP).test(str)

const execUrlNormalize = (groups, options = {}) => {
  const defaultProtocol = options.protocol || 'http'
  Object.keys(groups).forEach(key => {
    if (key === 'protocol') {
      if (groups[key] !== undefined) {
        const [protocol, slash] = groups[key].split(':')
        if (!slash) {
          groups[key] = defaultProtocol
          groups.origin = defaultProtocol + ':' + groups.origin
          groups.href = defaultProtocol + ':' + groups.href
        } else {
          groups[key] = protocol
        }
      } else {
        const protocolWidthSlash = defaultProtocol + '://'
        groups[key] = defaultProtocol
        if (groups.host) {
          // host exist
          groups.origin = protocolWidthSlash + groups.origin
          groups.href = protocolWidthSlash + groups.href
        }
      }
    } else if (key === 'host') {
      if (groups[key] !== undefined) {
        const [hostname, port] = groups[key].split(':')
        groups.hostname = hostname
        groups.port = port
      }
    } else if (key === 'pathname') {
      if (groups[key] !== undefined && !groups[key].startsWith('/')) {
        groups[key] = '/' + groups[key]
      }
    }
    if (groups[key] === undefined) {
      groups[key] = ''
    }
  })
  return groups.origin || groups.tail ? groups : null
}

const parseUrl = (str, options = {}) => {
  if (str === undefined) return null
  let res = URL_REG.exec(str)
  if (!res || res[0] !== str) return null
  res = {
    href: res[0],
    ...res.groups
  }
  return execUrlNormalize(res, options)
}

const FULL_INFO_CACHE = new Map()
const getUrlFullInfo = (str, incomplete, options = {}) => {
  if (!incomplete && FULL_INFO_CACHE.has(str)) return FULL_INFO_CACHE.get(str)
  const location = parseUrl(str, options)
  if (!location || !location.host && !location.pathname) return null
  location.ext = ''
  location.inside = !location.host && location.pathname || options.origins && options.origins.includes(location.origin)
  // empty ext regarded as source, though cgi
  if (!incomplete) {
    location.ext = (/\.([0-0a-z]+)$/i.exec(location.pathname) || [])[1] || ''
    FULL_INFO_CACHE.set(str, location)
  }
  return location
}

const URL_STYLE_REG = /url\((?<origin>(['"]?)(?<href>[^'" ]+)\2)\)/i

const parseStyleUrl = (str, test) => {
  let res = URL_STYLE_REG.exec(str)
  if (!res) return null
  const isValid = !test || testUrl(res.groups.href, true)
  return isValid ? res.groups : null
}

const getExecResult = (str, reg, condition = true) => {
  const regG = new RegExp(reg, 'g')
  const result = []
  let cur
  while (cur = regG.exec(str)) {
    if (!cur[0]) break
    if (typeof condition === 'function' ? condition(cur) : condition) {
      result.push(cur.groups)
    }
  }
  return result
}

const execUrl = (str) => getExecResult(str, URL_REG)

const execStyleUrl = (str, test) => getExecResult(str, URL_STYLE_REG, (cur) => !test || testUrl(cur.groups.href, true))

const transformCgi = (url, options = {}) => {
  // use options
  if (typeof options.transformCgi === 'function') return options.transformCgi(url)
  let urlObj = url
  if (typeof url === 'object') {
    url = url.href || ''
  } else if (typeof url === 'string') {
    urlObj = getUrlFullInfo(url, true, options)
  } else {
    console.error(`esrt transformCgi error! ${typeof url}`)
    console.error(url)
    throw new Error('url`s type must be object or string!')
  }
  // not url
  if (!urlObj) return url
  // extra
  if (!urlObj.inside) return options.blockExtraUrl ? '' : url
  // block path
  if (options.blockPaths.includes(urlObj.pathname)) return ''
  const l1Paths = Object.keys(options.l1PathMap)
  // don`t need to transform
  if (l1Paths.some((key) => urlObj.pathname.indexOf(options.l1PathMap[key]) === 0)) return url
  const levelPaths = urlObj.pathname.split('/').filter(v => v)
  // can`t transform
  if (!l1Paths.includes(levelPaths[0])) return options.blockIntraUrl ? '' : url
  levelPaths[0] = options.l1PathMap[levelPaths[0]]
  levelPaths[1] = options.l2PathMap[levelPaths[1]] || levelPaths[1]
  return levelPaths.join('/') + (urlObj.hash || urlObj.search)
}

module.exports = {
  testUrl,
  parseUrl,
  getUrlFullInfo,
  parseStyleUrl,
  execUrl,
  execStyleUrl,
  transformCgi
}

/***/ }),
/* 12 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const path = __webpack_require__(13)
const fs = __webpack_require__(14)
const winston = __webpack_require__(15)
const core = __webpack_require__(1)

// const dirname = path.resolve(process.cwd(), 'esrtlogs')
// if (fs.existsSync(filename)) fs.unlinkSync(filename)
const basename = path.resolve(process.cwd(), `esrtlogs/${formateDate()}`)
const filename = basename + '.log'

function formateDate() {
  const now = new Date()
  const date = [
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  ]
  const time = [
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  ]
  return date.join('-') + '/' + time.join(':')
}

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green'
})

const TRANSPORTS_MAP = {
  console: new winston.transports.Console({
    colorize: true,
    prettyPrint: true,
    timestamp() {
      return new Date().toLocaleTimeString()
    },
  }),
  file: new winston.transports.File({ filename, level: 'info' }),
}

const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: (core.options.loggerTransports || ['file']).map(key => TRANSPORTS_MAP[key])
})
logger.__logDataCache = {}
logger.callback = () => {
  if (!core.options.loggerDataToJson) return
  fs.writeFile(basename + '.json', JSON.stringify(logger.__logDataCache, null, 2), (err) => {
      if (err) throw err
      console.log('Data written to file')
  });
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

const formatCode = (code) => code.replace(/\s/g, ' ').slice(0, core.options.loggerCodeLength)

const cacheLogData = (data) => {
  if (!core.options.loggerDataToJson) return
  const { type, filename, parent } = data
  const key = parent || filename
  const newData = { ...data }
  delete newData.parent
  delete newData.filename
  if (!key) {
    delete newData.type
    if (!logger.__logDataCache[type]) {
      logger.__logDataCache[type] = []
    }
    logger.__logDataCache[type].push(newData)
    return
  }
  if (!logger.__logDataCache[type]) {
    logger.__logDataCache[type] = {}
  }
  newData.type = parent ? 'child' : 'current'
  if (logger.__logDataCache[type][key]) {
    logger.__logDataCache[type][key].push(newData)
  } else {
    logger.__logDataCache[type][key] = [newData]
  }
}

const wrapper = (f) => (data) => {
  cacheLogData(data)
  const { type, filename, parent, from, to, code, transformed, error, info } = data
  const arr = ['']
  if (parent) {
    arr.push(`parent: ${parent}`)
  } else if (filename) {
    arr.push(`current: ${filename}`)
  }
  if (from) {
    arr.push(`${from} => ${to || from}`)
  }
  if (code) {
    arr.push(`code: ${formatCode(code)}`)
  }
  if (transformed) {
    arr.push(`transformed: ${formatCode(transformed)}`)
  }
  if (error) {
    arr.push(error)
  } 
  if (info) {
    arr.push(info)
  }
  const tag = `[ESRT-${type}]`
  return f.call(logger, arr.join(`\n${tag}`))
}

Object.keys(levels).forEach(method => {
  const f = logger[method]
  logger[method] = wrapper(f)
})

module.exports = logger

/***/ }),
/* 13 */
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),
/* 14 */
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),
/* 15 */
/***/ ((module) => {

"use strict";
module.exports = require("winston");;

/***/ }),
/* 16 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const path = __webpack_require__(13)
const core = __webpack_require__(1)
const logger = __webpack_require__(12)

class Transformer {
  constructor({ code, map, meta, filename, parent, loader, plugin }, options = core.options) {
    this.code = code
    this.map = map
    this.meta = meta
    this.filename = filename ? path.relative(options.context || process.cwd(), filename) : `temp-${Date.now()}`
    this.parent = parent
    this.options = options
    this.loader = loader
    this.plugin = plugin
    this.setFilename(filename)
    this.init()
  }

  setFilename(filename) {
    if (!filename) {
      if (this.loader) {
        filename = this.loader.resourcePath
      } else if (this.plugin) {
        filename = this.plugin.options.template.split('!').slice(-1)[0]
      } else {
        filename = `temp-${Date.now()}`
      }
    }
    this.filename = filename
  }

  init() {}

  transform() {}

  async transformAsync() {}

  log(options, type = 'info') {
    logger[type] && logger[type]({
      ...options,
      filename: this.filename,
      parent: this.parent,
      type: this.__proto__.constructor.name.replace('Transformer', '').toLowerCase()
    })
  }
}

module.exports = Transformer

/***/ }),
/* 17 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const factory = __webpack_require__(3)
const TsTransformer = __webpack_require__(18)

module.exports = factory(TsTransformer)

/***/ }),
/* 18 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ts = __webpack_require__(5)
const TsProcessor = __webpack_require__(19)
const { transformCgi } = __webpack_require__(11)
const {
  getParseBase64Promise,
} = __webpack_require__(8)
const { printNode } = __webpack_require__(4)
const Transformer = __webpack_require__(16)
const core = __webpack_require__(1)

class TsTransformer extends Transformer {
  init() {
    this.sourceFile = ts.createSourceFile(this.filename, this.code, ts.ScriptTarget.Latest, /*setParentNodes */ true)
    this.processor = new TsProcessor(this.sourceFile, { ...this.options })
  }

  transformAsync() {
    const { changeset } = this.processor.traverse()
    let transformedCode = this.code
    const genNewCodePromise = (cs, isSpecific) => {
      let targetCs
      if (!isSpecific) {
        const { location, locations, node, text } = cs
        if (!ts.isTemplateExpression(node) && (locations || location.ext && location.ext !== 'js')) {
          // not support template
          const promises = (locations || [location]).map(({ href }) => getParseBase64Promise(href))
          let newText = text
          return Promise
            .all(promises)
            .then(res => res.forEach((v, i) => v && (newText = locations ? newText.replace(locations[i].origin, v) : v)))
            .then(() => {
              if (newText === text) return
              let newNode = null
              if (ts.isStringLiteral(node)) {
                newNode = ts.createStringLiteral(newText)
              } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
                newNode = ts.createNoSubstitutionTemplateLiteral(newText)
              }
              return newNode && {
                ...cs,
                target: printNode(newNode, changeset.sourceFile)
              }
            })
        }
        targetCs = cs
      } else {
        if (!cs.child || !(targetCs = cs.child.value[0])) return Promise.resolve()
      }
      // cgi
      const { node, location } = targetCs
      if (location.ext) return Promise.resolve()
      const newUrl = transformCgi(location, core.options)
      if (!location.inside && !core.options.blockExtraUrl || newUrl === (ts.isTemplateExpression(node) ? node.head.text : node.text)) return Promise.resolve()
      let newNode = null
      if (ts.isStringLiteral(node)) {
        newNode = ts.createStringLiteral(newUrl)
      } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
        newNode = ts.createNoSubstitutionTemplateLiteral(newUrl)
      } else if (ts.isTemplateExpression(node)) {
        newNode = ts.createTemplateExpression(ts.createTemplateHead(newUrl), node.templateSpans)
      }
      if (!newNode) return Promise.resolve()
      if (isSpecific) {
        newNode = ts.transform(cs.node, [(context) => (root) => {
          const nodeVisitor = (old) => old === node ? newNode : ts.visitEachChild(old, nodeVisitor, context)
          return ts.visitNode(root, nodeVisitor)
        }]).transformed[0]
      }
      return Promise.resolve({
        ...cs,
        target: printNode(newNode, changeset.sourceFile)
      })
    }
    const promises = changeset.value.map((cs) => genNewCodePromise(cs, cs.access instanceof Array))
    return Promise.all(promises).then(res => {
      let diff = 0
      res.forEach(cs => {
        if (!cs) return
        // recover prefix space
        // const oldCode = transformedCode.substr(cs.start + diff, cs.end - cs.start)
        // const newCode = (oldCode.match(/^\s+/) || [''])[0] + cs.target
        try {
          cs.start = cs.node.getStart()
        } catch(err) {
          // debugger
        }
        const oldCode = transformedCode.substr(cs.start + diff, cs.end - cs.start)
        const newCode = cs.target
        this.log({
          code: oldCode,
          transformed: newCode
        })
        transformedCode = transformedCode.substr(0, cs.start + diff) + newCode + transformedCode.substr(cs.end + diff)
        diff += newCode.length - cs.end + cs.start
      })
      return transformedCode
    })
  }
}

module.exports = TsTransformer

/***/ }),
/* 19 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ts = __webpack_require__(5)
const { getUrlFullInfo, execStyleUrl } = __webpack_require__(11)
const {
  getAccess,
  isMatchAccess,
  isIgnoreAccess,
  printNode
} = __webpack_require__(4)
const Changeset = __webpack_require__(20)
const core = __webpack_require__(1)

const keywords = 'align-content align-items align-self all animation animation-delay animation-direction animation-duration animation-fill-mode animation-iteration-count animation-name animation-play-state animation-timing-function backface-visibility background background-attachment background-blend-mode background-clip background-color background-image background-origin background-position background-repeat background-size border border-bottom border-bottom-color border-bottom-left-radius border-bottom-right-radius border-bottom-style border-bottom-width border-collapse border-color border-image border-image-outset border-image-repeat border-image-slice border-image-source border-image-width border-left border-left-color border-left-style border-left-width border-radius border-right border-right-color border-right-style border-right-width border-spacing border-style border-top border-top-color border-top-left-radius border-top-right-radius border-top-style border-top-width border-width bottom box-decoration-break box-shadow box-sizing break-after break-before break-inside caption-side caret-color @charset clear clip color column-count column-fill column-gap column-rule column-rule-color column-rule-style column-rule-width column-span column-width columns content counter-increment counter-reset cursor direction display empty-cells filter flex flex-basis flex-direction flex-flow flex-grow flex-shrink flex-wrap float font @font-face font-family font-feature-settings @font-feature-values font-kerning font-language-override font-size font-size-adjust font-stretch font-style font-synthesis font-variant font-variant-alternates font-variant-caps font-variant-east-asian font-variant-ligatures font-variant-numeric font-variant-position font-weight grid grid-area grid-auto-columns grid-auto-flow grid-auto-rows grid-column grid-column-end grid-column-gap grid-column-start grid-gap grid-row grid-row-end grid-row-gap grid-row-start grid-template grid-template-areas grid-template-columns grid-template-rows hanging-punctuation height hyphens image-rendering @import isolation justify-content @keyframes left letter-spacing line-break line-height list-style list-style-image list-style-position list-style-type margin margin-bottom margin-left margin-right margin-top max-height max-width @media min-height min-width mix-blend-mode object-fit object-position opacity order orphans outline outline-color outline-offset outline-style outline-width overflow overflow-wrap overflow-x overflow-y padding padding-bottom padding-left padding-right padding-top page-break-after page-break-before page-break-inside perspective perspective-origin pointer-events position quotes resize right scroll-behavior tab-size table-layout text-align text-align-last text-combine-upright text-decoration text-decoration-color text-decoration-line text-decoration-style text-indent text-justify text-orientation text-overflow text-shadow text-transform text-underline-position top transform transform-origin transform-style transition transition-delay transition-duration transition-property transition-timing-function unicode-bidi user-select vertical-align visibility white-space widows width word-break word-spacing word-wrap writing-mode z-index box-orient box-align box-pack'.split(' ')

const totalSet = new Set([...keywords])

function cssDetect(code) {
  if (code.length < 50) return false

  let c = 0
  let matchedLength = 0
  const regGroup = code.match(/\b[\w-]+?:[^;\n]+/gm)
  if (!regGroup) return false

  for (let i = 0; i < regGroup.length; i++) {
    matchedLength += regGroup[i].length

    const s = regGroup[i].split(':')[0]
    if (s && totalSet.has(s.replace(/^webkit-/, ''))) c += 1
  }

  if (regGroup.length > 0) {
    return c / regGroup.length > 0.7 && matchedLength / code.length > 0.4
  }

  return false
}

const IgnoreType = {
  Console: 'Console',
  Log: 'Log',
  I18N: 'I18N',
  SpeedReportLog: 'SpeedReportLog',
  ErrorExp: 'ErrorExp',
  TypeNode: 'TypeNode',
  IdAttribute: 'IdAttribute',
  Property: 'Property',
  Enum: 'Enum',
  IgnoreComment: 'IgnoreComment',
  Import: 'Import',
  Require: 'Require',
  ImportKeyword: 'ImportKeyword',
  Export: 'Export'
}

/**
 * 需要忽略的节点
 * @param node 
 */
function isIgnoreNode(node, sourceFile) {
  if (ts.isImportDeclaration(node)) {
    return IgnoreType.Import
  }
  if (ts.isExportDeclaration(node)) {
    return IgnoreType.Export
  }
  // ignore console
  if (ts.isCallExpression(node)
    && ts.isPropertyAccessExpression(node.expression)
    && /^(window\.)?((__)?console|__log)\./.test(printNode(node.expression, sourceFile).trim())) {
    return IgnoreType.Console
  }
  if (ts.isCallExpression(node) && ts.isImportKeyword(node.expression)) return IgnoreType.ImportKeyword
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText === 'require') return IgnoreType.Require
  // type definition
  if (ts.isTypeNode(node)) return IgnoreType.TypeNode
  // ignore console
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.escapedText === 'log') return IgnoreType.Log
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'SPEED_REPORT_LOG') return IgnoreType.SpeedReportLog
  // Error
  if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Error') return IgnoreType.ErrorExp
  // Property
  if (node.parent && ts.isPropertyAssignment(node.parent) && node === node.parent.name) return IgnoreType.Property
  // Enum
  if (ts.isEnumDeclaration(node)) return IgnoreType.Enum
  // specific comment
  const comments = sourceFile.getFullText().substr(node.getFullStart(), node.getStart(sourceFile) - node.getFullStart())
  if (/@local-ignore/.test(comments)) return IgnoreType.IgnoreComment

  return false
}

class TsProcessor {
  constructor(sourceFile, options) {
    this.sourceFile = sourceFile
    this.options = options
    this.jsxAttribute = null

    this.traverseFuncs = [
      this.traverseExpression,
      this.traverseStringPlus,
      this.traverseString
    ]
  }

  traverse(root = this.sourceFile, changeset = new Changeset(this.sourceFile)) {
    const ast = ts.transform(root, [(context) => (root) => {
      const nodeVisitor = (node) => {
        if (isIgnoreNode(node, this.sourceFile)) return node
        if (!this.jsxAttribute && ts.isJsxAttribute(node)) this.jsxAttribute = node
        let res
        this.traverseFuncs.some(f => res = f.call(this, node, changeset))
        if (res) {
          if (res.ignore) return node
          return res.node
        }
        res = ts.visitEachChild(node, nodeVisitor, context)
        if (this.jsxAttribute === node) this.jsxAttribute = null
        return res
      }
      return ts.visitNode(root, nodeVisitor)
    }])
    return { node: ast.transformed[0], changeset }
  }

  traverseString(expr, changeset, incomplete = false) {
    let text = ''
    let location
    let cs
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      text = expr.text
      if (this.jsxAttribute && this.jsxAttribute.name.text === 'style' && ts.isPropertyAssignment(expr.parent) || cssDetect(text)) {
        const locations = execStyleUrl(text, true)
        if (!locations.length) return
        cs = { node: expr, text, locations }
      }
    } else if (ts.isTemplateExpression(expr)) {
      text = expr.head.text
      incomplete = true
    } else {
      return
    }
    if (!cs && text && (location = getUrlFullInfo(text, incomplete, core.options))) {
      cs = { node: expr, text, location }
    }
    if (cs) {
      changeset.add(cs)
    }
    return { node: expr, changeset }
  }

  traverseStringPlus(expr, changeset) {
    const isStringPlusExp = node => ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken
    if (!isStringPlusExp(expr)) return
    const ast = ts.transform(expr, [(context) => (root) => {
      const handler = (node) => {
        if (!isStringPlusExp(node)) return this.traverse(node, changeset).node
        if (
          (ts.isStringLiteral(node.left) || ts.isNoSubstitutionTemplateLiteral(node.left)) &&
          (ts.isStringLiteral(node.right) || ts.isNoSubstitutionTemplateLiteral(node.right))
        ) {
          const textNode = new ts.createStringLiteral(node.left.text + node.right.text)
          textNode.parent = node.parent
          textNode.pos = node.left.pos
          textNode.end = node.right.end
          this.traverseString(textNode, changeset)
          return textNode
        } else if (ts.isStringLiteral(node.left) || ts.isNoSubstitutionTemplateLiteral(node.left) || ts.isTemplateExpression(node.left)) {
          this.traverseString(node.left, changeset)
          return node
        }
      }
      const nodeVisitor = (node) => {
        let newNode = handler(node)
        if (newNode) return newNode
        newNode = ts.visitEachChild(node, nodeVisitor, context)
        return handler(newNode) || newNode
      }
      return ts.visitNode(root, nodeVisitor)
    }])
    return { node: ast.transformed[0], changeset }
  }

  traverseExpression(expr, changeset) {
    const isBinaryExpression = ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.EqualsToken
    const isCallExpression = ts.isCallExpression(expr)

    if (!isBinaryExpression && !isCallExpression) return

    let accessEntry
    let argsEntry

    if (isBinaryExpression) {
      accessEntry = 'left'
      argsEntry = 'right'
    } else {
      accessEntry = 'expression'
      argsEntry = 'arguments'
    }
    const access = getAccess(expr[accessEntry])
    if (isIgnoreAccess(access, isCallExpression)) return { ignore: true }
    if (!isMatchAccess(access, isCallExpression)) return
    const child = expr[argsEntry] instanceof Array ? expr[argsEntry][0] : expr[argsEntry]
    if (!child) return
    let childChangeset = new Changeset(this.sourceFile)
    let childRes = this.traverse(child, childChangeset)

    if (childRes) {
      if (expr[argsEntry] instanceof Array) {
        expr[argsEntry][0] = childRes.node
      } else {
        expr[argsEntry] = childRes.node
      }
      changeset.add({ node: expr, access, child: childChangeset })
      return { node: expr, changeset }
    }
  }
}

module.exports = TsProcessor

/***/ }),
/* 20 */
/***/ ((module) => {

class Changeset {
  constructor(sourceFile) {
    // {
    //   start: 0,
    //   end: 0,
    //   text: '',
    //   target: '',
    //   node: null,
    //   meta: null
    // }
    this.sourceFile = sourceFile
    this._changesets = []
  }

  get value() {
    return this._changesets.map((cs, i) => {
      const preCsEnd = i ? this._changesets[i - 1].end : 0
      return {
        relativeStart: cs.start - preCsEnd,
        relativeEnd: cs.end - preCsEnd,
        ...cs
      }
    })
  }

  add(cs) {
    if (cs.start === undefined) {
      cs.start = cs.node.pos
      cs.end = cs.node.end
    }
    const [index, replace] = this.findInsertIndex(cs.start, cs.end)
    this._changesets.splice(index, replace, cs)
  }

  findInsertIndex(start, end) {
    if (!this._changesets.length) return [0, 0]
    let s = 0
    let e = this._changesets.length - 1
    let i
    while (s <= e) {
      i = Math.floor((s + e) / 2)
      const startMt = i ? start >= this._changesets[i - 1].end : true
      if (start <= this._changesets[i].start && end >= this._changesets[i].end) {
        let t = i + 1
        while (t < this._changesets.length && end >= this._changesets[t].end) {
          t += 1
        }
        // 重叠区间，替换
        return [i, t - i]
      } else if (startMt && end <= this._changesets[i].start) {
        s = i
        break
      } else if (!startMt) {
        e = i - 1
      } else {
        s = i + 1
      }
    }
    return [s, 0]
  }
}

module.exports = Changeset

/***/ }),
/* 21 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// If your plugin is direct dependent to the html webpack plugin:
const HtmlWebpackPlugin = __webpack_require__(22)
// If your plugin is using html-webpack-plugin as an optional dependency
// you can use https://github.com/tallesl/node-safe-require instead:
// const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin')
const HtmlTransformer = __webpack_require__(23)
const logger = __webpack_require__(12)

class HtmlWebpackESRTPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('ESRTPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'ESRTPlugin',
        (data, cb) => new HtmlTransformer({ code: data.html, plugin: data.plugin })
          .transformAsync()
          .then(html => cb(null, { ...data, html }))
          .then(() => logger.callback())
          .catch(e => cb(e))
      )
    })
  }
}

module.exports = HtmlWebpackESRTPlugin


/***/ }),
/* 22 */
/***/ ((module) => {

"use strict";
module.exports = require("html-webpack-plugin");;

/***/ }),
/* 23 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var __dirname = "src/core/transformer";
const htmlparser2 = __webpack_require__(24)
const domSerializer = __webpack_require__(25)
const domHandler = __webpack_require__(26)
const {
  getParseBase64Promise,
  getParseJsPromise
} = __webpack_require__(8)
const {
  testUrl,
  parseStyleUrl,
  execStyleUrl
} = __webpack_require__(11)
const Transformer = __webpack_require__(16)
const TsTransformer = __webpack_require__(18)
const CssTransformer = __webpack_require__(6)
const fs = __webpack_require__(14)
const path = __webpack_require__(13)
const core = __webpack_require__(1)

const addNode = (node, parent, type = 'prepend') => {
  // type append prepend reset
  if (type === 'reset') {
    parent.children = [node]
  } else if (type === 'prepend') {
    const nextSibling = parent.children[0]
    parent.children.unshift(node)
    if (nextSibling) {
      node.next = nextSibling
      nextSibling.prev = node
    }
  } else if (type === 'append') {
    const previousSibling = parent.children[parent.children.length - 1]
    parent.children.push(node)
    if (previousSibling) {
      node.prev = previousSibling
      previousSibling.next = node
    }
  }
  node.parent = parent
}

class HtmlTransformer extends Transformer {
  static getInjectJs(instance = { log: () => {} }) {
    if (!core.options.injectBlockMethod) return null
    if (!HtmlTransformer.injectJsCache) {
      try {
        const file = fs.readFileSync(path.resolve(__dirname, '../../inject/inject.production.js'), 'utf-8')
        HtmlTransformer.injectJsCache = file.replace('__OPTIONS__', JSON.stringify(core.options).replace(/"/g, '\\"'))
        instance.log({
          info: 'inject success!'
        })
      } catch (error) {
        instance.log({
          error,
          info: 'inject error!'
        }, 'error')
      }
    }
    return HtmlTransformer.injectJsCache || null
  }

  injectJs(head) {
    const js = HtmlTransformer.getInjectJs(this)
    if (!js) return
    if (!head) {
      head = new domHandler.Element('head')
      addNode(head, this.root)
    }
    addNode(new domHandler.Element('script', {}, [new domHandler.Text(js)]), head)
  }

  init() {
    this.root = htmlparser2.parseDocument(this.code)
  }

  dfs(node, handler) {
    const stack = [node]
    while (stack.length) {
      const cur = stack.pop()
      typeof handler === 'function' && handler(cur)
      stack.push(...(cur.children || []).map(v => v))
    }
  }

  traverse() {
    let head = null
    const shouldTransformNodes = []
    const hanler = (node) => {
      switch (node.name) {
        case 'link':
          if (testUrl(node.attribs.href)) shouldTransformNodes.push({ node, attr: 'href' })
          return
        case 'style':
        case 'script':
          const text = node.children.reduce((r, v) => r + v.data, '')
          if (testUrl(text)) {
            node.children = []
            shouldTransformNodes.push({ node, text })
            return
          }
        // case 'iframe':
        case 'source':
        case 'img':
          if (testUrl(node.attribs.src)) shouldTransformNodes.push({ node, attr: 'src' })
          return
        case 'head':
          head = node
          return
      }

      if (node.attribs && node.attribs.style && parseStyleUrl(node.attribs.style, true)) shouldTransformNodes.push({ node, attr: 'style' })
    }
    this.dfs(this.root, hanler)
    this.injectJs(head)
    return shouldTransformNodes
  }

  genPromise(item) {
    const { attr, node, text } = item
    if (attr === 'style') {
      // style attr
      const extractResult = execStyleUrl(node.attribs[attr], true)
      return Promise
        .all(extractResult.map(({ href }) => getParseBase64Promise(href)))
        .then(res => res.forEach((v, i) => {
          if (!v) return
          const newCode = node.attribs[attr].replace(extractResult[i].origin, v)
          this.log({
            from: 'tag attr style',
            code: node.attribs[attr],
            transformed: newCode
          })
          node.attribs[attr] = newCode
        }))
    } else if (attr) {
      if (attr === 'src' && node.name === 'script') {
        // js src
        return getParseJsPromise(node.attribs[attr]).then(v => {
          if (!v) return
          this.log({
            from: 'script attr src',
            to: 'script innerText',
            code: node.attribs[attr],
            transformed: v
          })
          const textNode = new domHandler.Text(v)
          node.children = [textNode]
          delete node.attribs[attr]
        })
      } else {
        // other link
        return getParseBase64Promise(node.attribs[attr]).then(v => {
          if (!v) return
          this.log({
            from: 'tag attr href',
            code: node.attribs[attr],
            transformed: v
          })
          node.attribs[attr] = v
        })
      }
    } else {
      const transformer = node.name === 'script' ? TsTransformer : CssTransformer
      return new transformer({ code: text, parent: this.filename })
        .transformAsync()
        .then(res => {
          const newTextNode = new domHandler.Text(node.name === 'script' ? res : res.css)
          addNode(newTextNode, node, 'reset')
        })
    }
  }

  transformAsync() {
    const items = this.traverse().map(item => this.genPromise(item))
    return Promise.all(items)
      .then(() => domSerializer.default(this.root))
      .catch(error => {
        this.log({
          error
        })
      })
  }
}

module.exports = HtmlTransformer

/***/ }),
/* 24 */
/***/ ((module) => {

"use strict";
module.exports = require("htmlparser2");;

/***/ }),
/* 25 */
/***/ ((module) => {

"use strict";
module.exports = require("dom-serializer");;

/***/ }),
/* 26 */
/***/ ((module) => {

"use strict";
module.exports = require("domhandler");;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })()
;
});