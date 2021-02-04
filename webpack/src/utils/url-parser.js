const core = require('../core/index.js')

const URL_VALID_CHARS = `-_.~!*'();:@&=+$,/?#`
const VALID_CHARS = {
  pathname: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[.;:@&=+$,/?#']/g, '').split('').join('\\'),
  host: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[.;:@&=+$,/?#']/g, '').split('').join('\\'),
  hash: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[.?#']/g, '').split('').join('\\'),
  search: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[.?#']/g, '').split('').join('\\'),
}
const URL_REGS = {
  protocol: /(?<protocol>(https?:)?\/\/)/,
  pathname: new RegExp(`(?<pathname>(^[${VALID_CHARS.pathname}]+)?(\\/[${VALID_CHARS.pathname}]+)*\\/?)`),
  host: new RegExp(`(?<host>([${VALID_CHARS.host}])+(\\.[${VALID_CHARS.host}]+)+(:\d+)?)`),
  hash: new RegExp(`/(?<hash>#[${VALID_CHARS.hash}]+)`),
  search: new RegExp(`(?<search>\\?[${VALID_CHARS.search}]+)`)
}
const URL_ORIGIN_REG = new RegExp(`(?<origin>${URL_REGS.protocol.source}${URL_REGS.host.source})`)
const URL_TAIL_REG = new RegExp(`(?<tail>${URL_REGS.pathname.source}?(${URL_REGS.hash.source}|${URL_REGS.search.source})?)`)
const URL_REG = new RegExp(`(${URL_ORIGIN_REG.source})?${URL_TAIL_REG.source}`, 'i')
const URL_REG_START = new RegExp(`^${URL_REG.source}`, URL_REG.flags)

const testUrl = (str, start) => {
  const res = (start ? URL_REG_START : URL_REG).exec(str)
  if (!res) return false
  const { origin, tail } = res.groups
  return !!(origin || tail)
}

const execUrlNormalize = (groups) => {
  const defaultProtocol = core.options.protocol
  Object.keys(groups).forEach(key => {
    if (key === 'protocol') {
      if (groups[key] !== undefined) {
        const [protocol, slash] = groups[key].split(':')
        if (!slash) {
          groups[key] = defaultProtocol
          groups.origin = defaultProtocol + groups.origin
          groups.href = defaultProtocol + groups.href
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

const parseUrl = (str) => {
  let res = URL_REG.exec(str)
  if (!res) return null
  res = {
    href: res[0],
    ...res.groups
  }
  return execUrlNormalize(res)
}

const getUrlFullInfo = (str, incomplete) => {
  const location = parseUrl(str)
  if (!location) return null
  location.ext = ''
  if (!location.host && location.pathname || core.options.origins.includes(location.origin)) {
    location.inside = true
  }
  // empty ext regarded as source, though cgi
  if (!incomplete) {
    const ext = /\.([0-0a-z]+)$/i.exec(location.search)
    if (ext) location.ext = ext[1]
  }
  return location
}

const URL_STYLE_REG = /url\((?<origin>(['"]?)(?<url>[^'" ]+)\2)\)/i

const parseStyleUrl = (str, test) => {
  let res = URL_STYLE_REG.exec(str)
  if (!res) return null
  const isValid = !test || testUrl(res.groups.url, true)
  return isValid ? res.groups : null
}

const getExecResult = (str, reg, condition = true) => {
  const regG = new RegExp(reg, 'g')
  const result = []
  while (cur = regG.exec(str)) {
    if (typeof condition === 'function' ? condition(cur) : condition) {
      result.push(cur.groups)
    }
  }
  return result
}

const execUrl = (str) => getExecResult(str, URL_REG)

const execStyleUrl = (str, test) => getExecResult(str, URL_STYLE_REG, (cur) => !test || testUrl(cur.groups.url, true))

const transformCgi = (url) => {
  const options = core.options
  // use options
  if (typeof options.transformCgi === 'function') return options.transformCgi(url)
  const urlObj = typeof url === 'object' ? url : getUrlFullInfo(url)
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