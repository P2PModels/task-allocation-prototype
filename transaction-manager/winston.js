const winston = require('winston')
const { path: rootPath } = require('app-root-path')
const { argv } = require('./config')

const {combine, timestamp, prettyPrint, colorize , printf} = winston.format

const generalFormat = combine(
  timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
  printf(info => `[${info.timestamp}] ${info.service} ${info.level}: ${info.message}`)
)

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
  printf(info => `[${info.timestamp}] ${info.service} ${info.level}: ${info.message}`)
)

// winston.addColors()
const logger = winston.createLogger({
  level: 'info',
  format: generalFormat,
  defaultMeta: { service: 'events-listener' },
  transports: [
    new winston.transports.File({ filename: `${rootPath}/logs/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${rootPath}/logs/events.log` }),
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
});

module.exports = logger