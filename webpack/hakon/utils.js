

const cacheMap = new Map()

const urlExtractReg = /(?<origin>(?:\/\/|(?<protocol>http(?:s)?):\/\/)?(?<host>(?<hostname>[^/:]+)(?::(?<port>\d+))?)?)(?:(?<pathname>(?:\/[^/#?]+)+)(?:(?<hash>#.+)|(?<search>\?.+))?)/i

const urlStyleTestReg = /url\((?<origin>(['"]?)(?<url>[^'" ]+)\2)\)/i

const getIpAdress = () => {
  let ipAdress = cacheMap.get('ipAdress')
  if (ipAdress) {
    return ipAdress
  }
  const interfaces = require('os').networkInterfaces()
  for (const devName in interfaces) {
    for (let i = 0; i < interfaces[devName].length; i++) {
      const alias = interfaces[devName][i]
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        cacheMap.set('ipAdress', alias.address)
        return alias.address
      }
    }
  }
}

const getParseBase64Promise = (url) => new Promise((resolve, reject) => {
  let groups
  try {
    groups = urlExtractReg.exec(url).groups
  } catch (err) {
    reject(err)
  }
  let fetch
  if (groups.protocol === 'http') {
    fetch = require('http')
  } else if (groups.protocol === 'https') {
    fetch = require('https')
  } else {
    reject('can not reconize protocol')
  }
  fetch.get(url, function (res) {
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
  getIpAdress,
  getParseBase64Promise
}