const http = require('http')
const https = require('https')
const { getUrlFullInfo } = require('./url-parser')

const sourceCache = new Map()

const FETCH_PROTOCOL = {
  http,
  https,
}

const isSupportExt = (ext) => {
  return ext && !/^(html?|exe|apk)$/i.test(ext)
}

const httpGet = (url, cb, { options, logger } = {}) =>
  new Promise((resolve, reject) => {
    const fullInfo = getUrlFullInfo(url, false, options)
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
    logger &&
      logger.info({
        type: fullInfo.protocol,
        code: url,
        transformed: fullInfo.href,
      })
    let retryTimes = 0
    const getErrorCallback = (req) => (error) => {
      logger &&
        logger.error({
          type: fullInfo.protocol,
          error,
          info: `retryTimes: ${retryTimes}`,
        })
      req && req.abort()
      if ((retryTimes += 1) <= options.requestRetryTimes) {
        fetch()
      } else {
        resolve()
      }
    }
    const fetch = () => {
      const req = FETCH_PROTOCOL[fullInfo.protocol].get(
        fullInfo.href,
        {
          timeout: options.requestTimeout,
        },
        (res) => {
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
        }
      )
      req.on('timeout', () => req.abort())
      req.on('error', getErrorCallback(req))
    }

    fetch()
  })

const getParseBase64Promise = (url, core) =>
  httpGet(
    url,
    (data, promise) => {
      const { res, chunks, size } = data
      const { resolve } = promise
      resolve(`data:${res.headers['content-type']};base64,` + Buffer.concat(chunks, size).toString('base64'))
    },
    core
  )

const getParseJsPromise = (url, core) =>
  httpGet(
    url,
    (data, promise) => {
      const { chunks, size } = data
      const { resolve } = promise
      resolve(Buffer.concat(chunks, size).toString('utf8'))
    },
    core
  )

module.exports = {
  getParseBase64Promise,
  getParseJsPromise,
}
