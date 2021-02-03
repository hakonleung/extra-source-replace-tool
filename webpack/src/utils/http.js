const http = require('http')
const https = require('https')
const { getUrlFullInfo } = require('./url-parser')

const FETCH_PROTOCOL = {
  http,
  https
}

const httpGet = (url, cb) => new Promise((resolve, reject) => {
  const fullInfo = getUrlFullInfo(url)
  if (!fullInfo || fullInfo.isRelative || !FETCH_PROTOCOL[fullInfo.protocol]) {
    resolve()
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
  getParseBase64Promise,
  getParseJsPromise
}