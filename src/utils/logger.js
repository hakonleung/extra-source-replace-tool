const path = require('path')
const fs = require('fs')
const winston = require('winston')

// const dirname = path.resolve(process.cwd(), 'esrtlogs')
// if (fs.existsSync(filename)) fs.unlinkSync(filename)
const basename = path.resolve(process.cwd(), `esrtlogs/${formateDate()}`)
const filename = basename + '.log'

function formateDate() {
  const now = new Date()
  const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  const time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()]
  return date.join('-') + '/' + time.join(':')
}

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green',
})

const TRANSPORTS_MAP = {
  console: () =>
    new winston.transports.Console({
      colorize: true,
      prettyPrint: true,
      timestamp() {
        return new Date().toLocaleTimeString()
      },
    }),
  file: () => new winston.transports.File({ filename, level: 'info' }),
}

const getLogger = (coreInstance) => {
  const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: (coreInstance.options.loggerTransports || [])
      .map((key) => typeof TRANSPORTS_MAP[key] === 'function' && TRANSPORTS_MAP[key]())
      .filter((v) => v),
  })
  logger.__logDataCache = {}
  logger.writeDataToJson = () => {
    if (!coreInstance.options.loggerDataToJson) return
    fs.writeFile(basename + '.json', JSON.stringify(logger.__logDataCache, null, 2), (err) => {
      if (err) throw err
      console.log('Data written to file')
    })
  }

  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  }

  const formatCode = (code) => code.replace(/\s/g, ' ').slice(0, coreInstance.options.loggerCodeLength)

  const cacheLogData = (data) => {
    const { type, filename, parent } = data
    const key = parent || filename
    const newData = { ...data }
    delete newData.parent
    delete newData.filename
    if (!key) {
      delete newData.type
      if (!logger.__logDataCache[type]) {
        logger.__logDataCache[type] = []
      }
      logger.__logDataCache[type].push(newData)
      return
    }
    if (!logger.__logDataCache[type]) {
      logger.__logDataCache[type] = {}
    }
    newData.type = parent ? 'child' : 'current'
    if (logger.__logDataCache[type][key]) {
      logger.__logDataCache[type][key].push(newData)
    } else {
      logger.__logDataCache[type][key] = [newData]
    }
  }

  const wrapper = (f) => (data) => {
    cacheLogData(data)
    const { type, filename, parent, from, to, code, transformed, error, info } = data
    const arr = ['']
    if (parent) {
      arr.push(`parent: ${parent}`)
    } else if (filename) {
      arr.push(`current: ${filename}`)
    }
    if (from) {
      arr.push(`${from} => ${to || from}`)
    }
    if (code) {
      arr.push(`code: ${formatCode(code)}`)
    }
    if (transformed) {
      arr.push(`transformed: ${formatCode(transformed)}`)
    }
    if (error) {
      arr.push(error)
    }
    if (info) {
      arr.push(info)
    }
    const tag = `[ESRT-${type}]`
    return (
      coreInstance.options.loggerTransports &&
      coreInstance.options.loggerTransports.length &&
      f.call(logger, arr.join(`\n${tag}`))
    )
  }

  Object.keys(levels).forEach((method) => {
    const f = logger[method]
    logger[method] = wrapper(f)
  })

  return logger
}

module.exports = getLogger
