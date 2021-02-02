const config = require('../core/config')

const URL_REGS = {
  protocol: /(?<protocol>(https?:)?\/\/)/,
  pathname: /(?<pathname>(\/[^/#?\s'"]+)*\/?)/,
  host: /(?<host>([^./:\s'"])+(\.[^./:\s'"]+)+(:\d+)?)/,
  hash: /(?<hash>#[^\s'"]+)/,
  search: /(?<search>\?[^\s'"]+)/
}

const URL_ORIGIN_REG = new RegExp(`(?<origin>${URL_REGS.protocol.source}?${URL_REGS.host.source})`)
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
  Object.keys(groups).forEach(key => {
    if (key === 'protocol') {
      if (groups[key] !== undefined) {
        const [protocol, slash] = res[key].split(':')
        if (!slash) {
          groups[key] = config.protocol
          groups.origin = config.protocol + groups.origin
          groups.href = config.protocol + groups.href
        } else {
          groups[key] = protocol
        }
      } else {
        const protocolWidthSlash = config.protocol + '://'
        groups[key] = config.protocol
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
    }
    if (res[key] === undefined) {
      groups[key] = ''
    }
  })
  return groups
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

module.exports = {
  testUrl,
  parseUrl,
  parseStyleUrl,
  execUrl,
  execStyleUrl
}