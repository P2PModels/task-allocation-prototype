const sqlite3 = require('sqlite3').verbose()

class DAO {
  constructor(dbPath) {
    this.db = new sqlite3.Database(
      `${dbPath}.db`,
      sqlite3.OPEN_READWRITE,
      err => {
        if (err) console.error(`Could not connect to the  database`, err)
        else console.log(`Connected to the database`)
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
