const path = require('path')
const fs = require('fs')
const winston = require('winston')
const core = require('../core')

// const dirname = path.resolve(process.cwd(), 'esrtlogs')
// if (fs.existsSync(filename)) fs.unlinkSync(filename)
const filename = path.resolve(process.cwd(), `esrtlogs/${formateDate()}.log`)

function formateDate() {
  const now = new Date()
  const date = [
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  ]
  const time = [
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  ]
  return date.join('-') + '/' + time.join(':')
}

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green'
})

const TRANSPORTS_MAP = {
  console: new winston.transports.Console({
    colorize: true,
    prettyPrint: true,
    timestamp() {
      return new Date().toLocaleTimeString()
    },
  }),
  file: new winston.transports.File({ filename, level: 'info' }),
}

const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: (core.options.loggerTransports || ['file']).map(key => TRANSPORTS_MAP[key])
})

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

const wrapper = (f) => (...args) => {
  return f.call(logger, ['[ESRT]', ...args].join(' ** '))
}

Object.keys(levels).forEach(method => {
  const f = logger[method]
  logger[method] = wrapper(f)
})


module.exports = logger