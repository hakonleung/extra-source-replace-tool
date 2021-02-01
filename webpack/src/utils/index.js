
const config = require('../core/config')

const cacheMap = new Map()

const urlExtractReg = /(?<href>(?<origin>(?<absolute>\/\/|(?<protocol>http(?:s)?):\/\/)?(?<host>(?<hostname>[^/:\s'"]+)(?::(?<port>\d+))?)?)(?:(?<pathname>(?:\/[^/#?\s'"]+)+)(?:(?<hash>#[^\s]+)|(?<search>\?[^\s]+))?))/i

const urlStyleTestReg = /url\((?<origin>(['"]?)(?<url>[^'" ]+)\2)\)/i

const parseUrl = (str) => {
  let res = urlExtractReg.exec(str)
  if (!res) return null
  res = res.groups
  Object.keys(res).forEach(key => {
    if (res[key] === undefined) {
      if (key === 'protocol') {
        res[key] = config.protocol
        if (res.absolute) {
          res.href = config.protocol + ':' + res.href
        }
      }
    }
  })
  return res
}

const httpGet = (url, cb) => new Promise((resolve, reject) => {
  const groups = parseUrl(url)
  if (!groups || !groups.absolute || !['http', 'https'].includes(groups.protocol)) {
    resolve()
  }
  const fetch = require(groups.protocol)
  fetch.get(groups.href, function (res, req) {
    const chunks = []
    let size = 0
    res.on('data', function (chunk) {
      chunks.push(chunk)
      size += chunk.length
    })
    res.on('end', function (err) {
      if (err) reject(err)
      const data = { res, req, chunks, size }
      const promise = { resolve, reject }
      if (typeof cb === 'function') {
        cb(data, promise)
      }
      resolve(data)
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
  urlStyleTestReg,
  urlExtractReg,
  getParseBase64Promise,
  getParseJsPromise
}