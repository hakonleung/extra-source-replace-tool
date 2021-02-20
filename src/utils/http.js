const http = require('http')
const https = require('https')
const { getUrlFullInfo } = require('./url-parser')
const core = require('../core')

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
  try {
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
  } catch (err) {
    resolve()
  }
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