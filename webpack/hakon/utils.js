
const config = require('./config')

const cacheMap = new Map()

const urlExtractReg = /(?<href>(?<origin>(?<absolute>\/\/|(?<protocol>http(?:s)?):\/\/)?(?<host>(?<hostname>[^/:]+)(?::(?<port>\d+))?)?)(?:(?<pathname>(?:\/[^/#?]+)+)(?:(?<hash>#.+)|(?<search>\?.+))?))/i

const urlStyleTestReg = /url\((?<origin>(['"]?)(?<url>[^'" ]+)\2)\)/i

// const getIpAdress = () => {
//   let ipAdress = cacheMap.get('ipAdress')
//   if (ipAdress) {
//     return ipAdress
//   }
//   const interfaces = require('os').networkInterfaces()
//   for (const devName in interfaces) {
//     for (let i = 0; i < interfaces[devName].length; i++) {
//       const alias = interfaces[devName][i]
//       if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
//         cacheMap.set('ipAdress', alias.address)
//         return alias.address
//       }
//     }
//   }
// }

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

const getParseBase64Promise = (url) => new Promise((resolve, reject) => {
  const groups = parseUrl(url)
  if (!groups || !groups.absolute || !['http', 'https'].includes(groups.protocol)) {
    resolve()
  }
  const fetch = require(groups.protocol)
  fetch.get(groups.href, function (res) {
    const chunks = []
    let size = 0
    res.on('data', function (chunk) {
      chunks.push(chunk)
      size += chunk.length
    })
    res.on('end', function (err) {
      if (err) reject(err)
      const contentType = res.headers['content-type']
      resolve(`data:${contentType};base64,` + Buffer.concat(chunks, size).toString('base64'))
    })
  })
})

module.exports = {
  urlStyleTestReg,
  urlExtractReg,
  // getIpAdress,
  getParseBase64Promise
}