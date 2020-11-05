const sqlite3 = require('sqlite3').verbose()
const logger = require('../winston')

class DAO {
  constructor(dbPath) {
    this.db = new sqlite3.Database(
      `${dbPath}.db`,
      sqlite3.OPEN_READWRITE,
      err => {
        if (err) logger.error(`Could not connect to the  database ${err}`)
        else logger.info(`Demo data database set up`)
      }
    )
  }

  run(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err, res) => {
        if (err) reject(err)
        else resolve(res)
      })
    })
  }

  all(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, res) => {
        if (err) reject(err)
        else resolve(res)
      })
    })
  }
}

module.exports = DAO
