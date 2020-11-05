const winston = require('winston')
const { path: rootPath } = require('app-root-path')
const { combine, timestamp, colorize, printf, json } = winston.format

const generalFormat = combine(
  timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
  json()
)

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
  printf(
    info => `[${info.timestamp}] ${info.service} ${info.level}: ${info.message}`
  )
)

// winston.addColors()
const logger = winston.createLogger({
  level: 'info',
  format: generalFormat,
  defaultMeta: { service: 'amara-proxy-api' },
  transports: [
    new winston.transports.File({
      filename: `${rootPath}/logs/error.log`,
      level: 'error',
    }),
    new winston.transports.File({ filename: `${rootPath}/logs/logs.log` }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
})

logger.stream = {
  write: function (message, encoding) {
    logger.info(message)
  },
}

module.exports = logger
