const http = require('http')
const https = require('https')
const { getUrlFullInfo } = require('./url-parser')
const core = require('../core')

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
  try {
    const req = FETCH_PROTOCOL[fullInfo.protocol].get(fullInfo.href, {
      timeout: core.options.requestTimeout
    }, (res) => {
      const chunks = []
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })
      res.on('end', (err) => {
        if (err) return reject(err)
        data = { res, chunks, size: chunks.reduce((sum, c) => sum + c.length, 0) }
        sourceCache.set(fullInfo.href, data)
        onEnd()
      })
    })
    const onError = (err) => {
      console.error(`esrt request error!`)
      console.error(`origin: ${url}`)
      console.error(`target: ${fullInfo.href}`)
      console.error(err)
      req.abort()
      resolve()
    }
    req.on('timeout', onError)
    req.on('error', onError)
  } catch (err) {
    onError(err)
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