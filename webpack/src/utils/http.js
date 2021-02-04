const http = require('http')
const https = require('https')
const { getUrlFullInfo } = require('./url-parser')

const sourceCache = new Map()

const FETCH_PROTOCOL = {
  http,
  https
}

const httpGet = (url, cb) => new Promise((resolve, reject) => {
  const fullInfo = getUrlFullInfo(url)
  if (!fullInfo || fullInfo.inside || !FETCH_PROTOCOL[fullInfo.protocol]) {
    resolve()
  }
  let data
  const onEnd = () => {
    if (typeof cb === 'function') {
      cb(data, { resolve, reject })
    }
    resolve(data)
  }
  if (data = sourceCache.get(fullInfo.href)) {
    onEnd()
  }
  FETCH_PROTOCOL[fullInfo.protocol].get(fullInfo.href, function (res, req) {
    const chunks = []
    let size = 0
    res.on('data', function (chunk) {
      chunks.push(chunk)
      size += chunk.length
    })
    res.on('end', function (err) {
      if (err) reject(err)
      data = { res, req, chunks, size }
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