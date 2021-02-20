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
const tsLoader = __webpack_require__(15)
const HtmlPlugin = __webpack_require__(19)

module.exports = {
  core,
  cssLoader,
  tsLoader,
  HtmlPlugin
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
  },
  injectBlockMethod: true,
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
    const transformer = new Transformer({ code, map, meta, filename }, this)
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

const isAccessValid = (access, isCallExpression) => {
  const { global, globalAlias, validBinaryAccesses, validCallAccesses } = core.options
  const validAccesses = isCallExpression ? validCallAccesses : validBinaryAccesses
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

const getAccess = (node, verify, isCallExpression) => {
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
  return !verify || isAccessValid(access, isCallExpression) ? access : []
}

const isIgnoreFile = (source, map, filename) => {
  const { options } = core
  if (filename && options.ignorePath && options.ignorePath.test(filename)) return true
  const realSource = map && map.sourcesContent && map.sourcesContent.length > 0 ? map.sourcesContent[0].trim() : source
  const leadingComment = /^\/\/.*|^\/\*[\s\S]+?\*\//.exec(realSource)
  return leadingComment && /@local-ignore/.test(leadingComment[0])
}

module.exports = {
  stringPlusToTemplateExpression,
  isAccessValid,
  getAccess,
  isIgnoreFile
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
const loaderUtils = __webpack_require__(8)
const { getParseBase64Promise } = __webpack_require__(9)
const { parseStyleUrl } = __webpack_require__(12)
const Transformer = __webpack_require__(13)

class CssTransformer extends Transformer {
  init() {
    if (this.meta && this.meta.ast && this.meta.ast.type === 'postcss' && this.meta.ast.root) {
      this.root = this.meta.ast.root
    } else {
      this.root = postcss.parse(this.code)
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
        values.forEach((v, i) => v && (transformList[i].node.value = transformList[i].node.value.replace(transformList[i].origin, v)))

        const result = postcss().process(this.root, this.loader && loaderUtils.getOptions(this.loader))

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
/***/ ((module) => {

"use strict";
module.exports = require("loader-utils");;

/***/ }),
/* 9 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const http = __webpack_require__(10)
const https = __webpack_require__(11)
const { getUrlFullInfo } = __webpack_require__(12)
const core = __webpack_require__(1)

const sourceCache = new Map()

const FETCH_PROTOCOL = {
  http,
  https
}

const httpGet = (url, cb) => new Promise((resolve, reject) => {
  const fullInfo = getUrlFullInfo(url, false, core.options)
  if (!fullInfo || fullInfo.inside || !FETCH_PROTOCOL[fullInfo.protocol]) {
    resolve()
  }
  let data = sourceCache.get(fullInfo.href)
  const onEnd = () => {
    typeof cb === 'function' && cb(data, { resolve, reject })
    resolve(data)
  }
  // use cache
  if (data) onEnd()
  FETCH_PROTOCOL[fullInfo.protocol].get(fullInfo.href, (res) => {
    const chunks = []
    res.on('data', (chunk) => {
      chunks.push(chunk)
    })
    res.on('end', (err) => {
      if (err) reject(err)
      data = { res, chunks, size: chunks.reduce((sum, c) => sum + c.length, 0) }
      sourceCache.set(fullInfo.href, data)
      onEnd()
    })
  })
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
/* 10 */
/***/ ((module) => {

"use strict";
module.exports = require("http");;

/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";
module.exports = require("https");;

/***/ }),
/* 12 */
/***/ ((module) => {

const URL_VALID_CHARS = `-_.~!*'();:@&=+$,/?#`
const VALID_CHARS = {
  pathname: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[;:@&=+$,/?#']/g, '').split('').join('\\'),
  host: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[.;:@&=+$,/?#']/g, '').split('').join('\\'),
  hash: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[?#']/g, '').split('').join('\\'),
  search: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[?#']/g, '').split('').join('\\'),
}
const URL_REGS = {
  protocol: `(https?:)?\/\/`,
  pathname: `(^[${VALID_CHARS.pathname}]+)?((\\/[${VALID_CHARS.pathname}]+)+\\/?|\/)`,
  host: `([${VALID_CHARS.host}])+(\\.[${VALID_CHARS.host}]+)+(:\d+)?`,
  hash: `#[${VALID_CHARS.hash}]+`,
  search: `\\?[${VALID_CHARS.search}]+`
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
  if (!res) return null
  res = {
    href: res[0],
    ...res.groups
  }
  return execUrlNormalize(res, options)
}

const getUrlFullInfo = (str, incomplete, options = {}) => {
  const location = parseUrl(str, options)
  if (!location) return null
  location.ext = ''
  if (!location.host && location.pathname || options.origins && options.origins.includes(location.origin)) {
    location.inside = true
  }
  // empty ext regarded as source, though cgi
  if (!incomplete) {
    const ext = /\.([0-0a-z]+)$/i.exec(location.pathname)
    if (ext) location.ext = ext[1]
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
  const urlObj = typeof url === 'object' ? url : getUrlFullInfo(url, true, options)
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
/* 13 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const path = __webpack_require__(14)
const core = __webpack_require__(1)

class Transformer {
  constructor({ code, map, meta, filename }, loader, options = core.options) {
    this.code = code
    this.map = map
    this.filename = filename ? path.relative(options.context || process.cwd(), filename) : `temp-${Date.now()}`
    this.options = options
    this.loader = loader
    this.init()
  }

  init() {}

  transform() {}

  async transformAsync() {}
}

module.exports = Transformer

/***/ }),
/* 14 */
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),
/* 15 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const factory = __webpack_require__(3)
const TsTransformer = __webpack_require__(16)

module.exports = factory(TsTransformer)

/***/ }),
/* 16 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ts = __webpack_require__(5)
const TsProcessor = __webpack_require__(17)
const { transformCgi } = __webpack_require__(12)
const {
  getParseBase64Promise,
  getParseJsPromise
} = __webpack_require__(9)
const Transformer = __webpack_require__(13)
const core = __webpack_require__(1)

class TsTransformer extends Transformer {
  init() {
    this.sourceFile = ts.createSourceFile(this.filename, this.code, ts.ScriptTarget.Latest, /*setParentNodes */ true)
    this.processor = new TsProcessor(this.sourceFile, { ...this.options })
  }

  transformAsync() {
    const changeset = this.processor.getChangeset()
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
              let newNode = null
              if (ts.isStringLiteral(node)) {
                newNode = ts.createStringLiteral(newText)
              } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
                newNode = ts.createNoSubstitutionTemplateLiteral(newText)
              }
              return newNode && {
                ...cs,
                target: ts.createPrinter().printNode(ts.EmitHint.Unspecified, newNode, changeset.sourceFile)
              }
            })
        }
        targetCs = cs
      } else {
        if (!cs.child || !cs.child[0].value[0]) return Promise.resolve()
        targetCs = cs.child[0].value[0]
      }
      // cgi
      const { node, location } = targetCs
      if (location.ext) return Promise.resolve()
      const newUrl = transformCgi(location, core.options)
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
        target: ts.createPrinter().printNode(ts.EmitHint.Unspecified, newNode, changeset.sourceFile)
      })
    }
    const promises = changeset.value.map((cs) => genNewCodePromise(cs, cs.access instanceof Array))
    return Promise.all(promises).then(res => {
      let diff = 0
      res.forEach(cs => {
        if (!cs) return
        transformedCode = transformedCode.substr(0, cs.start + diff) + cs.target + transformedCode.substr(cs.end + diff)
        diff += cs.target.length - cs.end + cs.start
      })
      return transformedCode
    })
  }
}

module.exports = TsTransformer

/***/ }),
/* 17 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ts = __webpack_require__(5)
const { getUrlFullInfo, execStyleUrl } = __webpack_require__(12)
const {
  stringPlusToTemplateExpression,
  getAccess
} = __webpack_require__(4)
const Changeset = __webpack_require__(18)
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
  Import: 'Import'
}

/**
 * 需要忽略的节点
 * @param node 
 */
function isIgnoreNode(node, sourceFile) {
  if (ts.isImportDeclaration(node)) {
    return IgnoreType.Import
  }
  // ignore console
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
    (
      /^console\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      /^window.console\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      /^__console\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      /^window.__console\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      /^window.__log\./.test(ts.createPrinter().printNode(ts.EmitHint.Unspecified, node.expression, sourceFile).trim()) ||
      false
    )) {
    return IgnoreType.Console
  }
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
  }

  getChangeset(root = this.sourceFile, onlyChild) {
    // if (this.sourceFile.fileName.indexOf('test') !== -1) {
    //   debugger
    // }
    
    const changeset = new Changeset(this.sourceFile)
    const nodeVisitor = (node) => {
      if (ts.isJsxAttribute(node)) {
        this.jsxAttribute = node
      }
      if (isIgnoreNode(node, this.sourceFile)) return

      const result = this.process(node)
      if (result) {
        changeset.add(result)
        return
      }

      ts.forEachChild(node, nodeVisitor)
      if (this.jsxAttribute === node) {
        this.jsxAttribute = null
      }
    }
    
    ts[onlyChild ? 'forEachChild' : 'visitNode'](root, nodeVisitor)
    return changeset
  }

  process(node) {
    let result = null
    ;[
      this.expressionProc,
      this.stringPlusProc,
      this.stringProc,
    ].some(proc => result = proc.call(this, node))

    if (result) {
      if (result.start === undefined) {
        result.start = result.node.pos
        result.end = result.node.end
      }
      result.code = ts.createPrinter().printNode(ts.EmitHint.Unspecified, result.node, this.sourceFile)
    }

    return result
  }

  stringPlusProc(node) {
    const templateAst = stringPlusToTemplateExpression(node)
    if (templateAst) {
      const result = this.stringProc(templateAst)
      if (!result) return
      result.start = node.pos
      result.end = node.end
      return result
    }
  }

  stringProc(node) {
    let text = ''
    let incomplete = false
    let location
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      text = node.text
      if (this.jsxAttribute && this.jsxAttribute.name.text === 'style' && ts.isPropertyAssignment(node.parent) || cssDetect(text)) {
        if (location = execStyleUrl(text, true)) return { node, text, locations: location }
      }
    } else if (ts.isTemplateExpression(node)) {
      text = node.head.text
      incomplete = true
    }
    return text && (location = getUrlFullInfo(text, incomplete, core.options)) && {
      node,
      text,
      location,
    } || null
  }

  expressionProc(node) {
    const isBinaryExpression = ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
    const isCallExpression = ts.isCallExpression(node)
    let accessEntry
    let argsEntry
    
    if (isBinaryExpression || isCallExpression) {
      if (isBinaryExpression) {
        accessEntry = 'left'
        argsEntry = 'right'
      } else {
        accessEntry = 'expression'
        argsEntry = 'arguments'
      }
      const access = getAccess(node[accessEntry], true, isCallExpression)
      if (!access.length) return null
      const child = (node[argsEntry] instanceof Array ? node[argsEntry] : [node[argsEntry]]).map(v => this.getChangeset(v))
      if (child.length) {
        return { node, access, child }
      }
    }
    return null
  }
}

module.exports = TsProcessor

/***/ }),
/* 18 */
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
    // 不存在区间重合的情况
    const { start, end } = cs
    const index = this.findInsertIndex(start, end)
    this._changesets.splice(index, 0, cs)
  }

  findInsertIndex(start, end) {
    if (!this._changesets.length) return 0
    let s = 0
    let e = this._changesets.length - 1
    let i
    while (s <= e) {
      i = Math.floor((s + e) / 2)
      const startMt = i ? start >= this._changesets[i - 1].end : true
      if (startMt && end <= this._changesets[i].start) {
        s = i
        break
      } else if (!startMt) {
        e = i - 1
      } else {
        s = i + 1
      }
    }
    return s
  }
}

module.exports = Changeset

/***/ }),
/* 19 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// If your plugin is direct dependent to the html webpack plugin:
const HtmlWebpackPlugin = __webpack_require__(20)
// If your plugin is using html-webpack-plugin as an optional dependency
// you can use https://github.com/tallesl/node-safe-require instead:
// const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin')
const HtmlTransformer = __webpack_require__(21)

class HtmlLinkTransformPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('HtmlLinkTransformPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'HtmlLinkTransformPlugin',
        (data, cb) => new HtmlTransformer({ code: data.html })
          .transformAsync()
          .then(html => cb(null, { ...data, html }))
          .catch(e => cb(e))
      )
    })
  }
}

module.exports = HtmlLinkTransformPlugin


/***/ }),
/* 20 */
/***/ ((module) => {

"use strict";
module.exports = require("html-webpack-plugin");;

/***/ }),
/* 21 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var __dirname = "src/core/transformer";
const htmlparser2 = __webpack_require__(22)
const domSerializer = __webpack_require__(23)
const domHandler = __webpack_require__(24)
const {
  getParseBase64Promise,
  getParseJsPromise
} = __webpack_require__(9)
const {
  testUrl,
  parseStyleUrl,
  execStyleUrl
} = __webpack_require__(12)
const Transformer = __webpack_require__(13)
const TsTransformer = __webpack_require__(16)
const CssTransformer = __webpack_require__(6)
const fs = __webpack_require__(25)
const path = __webpack_require__(14)
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
  static getInjectJs() {
    if (!core.options.injectBlockMethod) return null
    if (!HtmlTransformer.injectJsCache) {
      try {
        const file = fs.readFileSync(path.resolve(__dirname, '../../inject/inject.production.js'), 'utf-8')
        HtmlTransformer.injectJsCache = file.replace('__OPTIONS__', JSON.stringify(core.options).replace(/"/g, '\\"'))
      } catch {
        debugger
      }
    }
    return HtmlTransformer.injectJsCache || null
  }

  injectJs(head) {
    const js = HtmlTransformer.getInjectJs()
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
        .then(res => res.forEach((v, i) => v && (node.attribs[attr] = node.attribs[attr].replace(extractResult[i].origin, v))))
    } else if (attr) {
      if (attr === 'src' && node.name === 'script') {
        // js src
        return getParseJsPromise(node.attribs[attr]).then(v => {
          delete node.attribs[attr]
          const textNode = new domHandler.Text(v)
          node.children = [textNode]
        })
      } else {
        // other link
        return getParseBase64Promise(node.attribs[attr]).then(v => v && (node.attribs[attr] = v))
      }
    } else {
      const transformer = node.name === 'script' ? TsTransformer : CssTransformer
      return new transformer({ code: text })
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
      .catch(err => {
        console.log(err)
      })
  }
}

module.exports = HtmlTransformer

/***/ }),
/* 22 */
/***/ ((module) => {

"use strict";
module.exports = require("htmlparser2");;

/***/ }),
/* 23 */
/***/ ((module) => {

"use strict";
module.exports = require("dom-serializer");;

/***/ }),
/* 24 */
/***/ ((module) => {

"use strict";
module.exports = require("domhandler");;

/***/ }),
/* 25 */
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

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