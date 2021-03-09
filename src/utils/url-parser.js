const URL_VALID_CHARS = `-_.~!*'();:@&=+$,/?#%`
const VALID_CHARS = {
  pathname:
    'a-z0-9\\' +
    URL_VALID_CHARS.replace(/[;:@&=+$,/?#'%]/g, '')
      .split('')
      .join('\\'),
  host:
    'a-z0-9\\' +
    URL_VALID_CHARS.replace(/[.;:@&=+$,/?#'%]/g, '')
      .split('')
      .join('\\'),
  hash: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[?#']/g, '').split('').join('\\'),
  search: 'a-z0-9\\' + URL_VALID_CHARS.replace(/[?#']/g, '').split('').join('\\'),
}
const URL_REGS = {
  protocol: `(https?:)?\\/\\/`,
  pathname: `(^[${VALID_CHARS.pathname}]+)?((\\/[${VALID_CHARS.pathname}]+)+\\/?|\\/)`,
  host: `([${VALID_CHARS.host}])+(\\.[${VALID_CHARS.host}]+)+(\\:\\d+)?`,
  hash: `#[${VALID_CHARS.hash}]*`,
  search: `\\?[${VALID_CHARS.search}]*`,
}
const _w = (name, group) => `(${group ? `?<${name}>` : ''}${URL_REGS[name]})`
Object.keys(URL_REGS).forEach((v) => {
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
const URL_REG_NO_GROUP_ALL = new RegExp(`^(${URL_REG_NO_GROUP.source})$`, URL_REG.flags)

const testUrl = (str, all) => str && (all ? URL_REG_NO_GROUP_ALL : URL_REG_NO_GROUP).test(str)

const execUrlNormalize = (groups, options = {}) => {
  const defaultProtocol = options.intraProtocol || 'http'
  Object.keys(groups).forEach((key) => {
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
        groups[key] = defaultProtocol

        // if host exist, protocol must not be empty
        // const protocolWidthSlash = defaultProtocol + '://'
        // if (groups.host) {
        //   // host exist
        //   groups.origin = protocolWidthSlash + groups.origin
        //   groups.href = protocolWidthSlash + groups.href
        // }
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
    ...res.groups,
  }
  return execUrlNormalize(res, options)
}

const FULL_INFO_CACHE = new Map()
const getUrlFullInfo = (str, incomplete, options = {}) => {
  if (!incomplete && FULL_INFO_CACHE.has(str)) return FULL_INFO_CACHE.get(str)
  const location = parseUrl(str, options)
  if (!location || (!location.host && !location.pathname)) return null
  location.ext = ''
  location.inside = !!(
    (!location.host && location.pathname) ||
    (options.intraHosts && options.intraHosts.includes(location.host))
  )
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
  while ((cur = regG.exec(str))) {
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
  if (!url) return ''
  let urlObj = url
  if (typeof url === 'object') {
    url = url.href || ''
  } else if (typeof url === 'string') {
    urlObj = getUrlFullInfo(url, true, options)
  } else {
    // console.error(`esrt transformCgi error! ${typeof url}`)
    // console.error(url)
    throw new Error('url`s type must be object or string!')
  }
  // not url
  if (!urlObj) return url
  // extra
  if (!urlObj.inside) return options.extraBlock ? '' : url
  // block path
  if (options.intraBlockPaths.includes(urlObj.pathname)) return ''
  const l1Paths = Object.keys(options.intraPathTopLevelRules)
  // don`t need to transform
  if (l1Paths.some((key) => urlObj.pathname.indexOf(options.intraPathTopLevelRules[key]) === 0)) return url
  const levelPaths = urlObj.pathname.split('/').filter((v) => v)
  // can`t transform
  if (!l1Paths.includes(levelPaths[0])) return options.intraBlock ? '' : url
  levelPaths[0] = options.intraPathTopLevelRules[levelPaths[0]]
  levelPaths[1] = options.intraPathSecondLevelRules[levelPaths[1]] || levelPaths[1]
  return levelPaths.join('/') + (urlObj.hash || urlObj.search)
}

module.exports = {
  testUrl,
  getUrlFullInfo,
  parseStyleUrl,
  execUrl,
  execStyleUrl,
  transformCgi,
}
