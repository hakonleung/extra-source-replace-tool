const path = require('path')
const fs = require('fs')
const winston = require('winston')

const filename = path.resolve(process.cwd(), 'esrt.log')
if (fs.existsSync(filename)) fs.unlinkSync(filename)

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green'
})

const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console({
      colorize: true,
      prettyPrint: true,
      timestamp() {
        return new Date().toLocaleTimeString()
      },
    }),
    new winston.transports.File({ filename, level: 'info' }),
  ]
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