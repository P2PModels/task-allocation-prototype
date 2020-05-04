class UserRepository {
  constructor(dao) {
    this.dao = dao
  }

  updateUser(id, active) {
    const sql = `UPDATE users SET active = ? WHERE id = ?`

    return new Promise((resolve, reject) => {
      this.dao.run(sql, [active, id], err => {
        if(err)
          reject(err)
        else
          resolve(this.changes)
      })
    })
  }

  readUserTeams(username) {
    const sql = `SELECT t.name FROM users u INNER JOIN user_team ut 
    on u.id = ut.idUser INNER JOIN teams t ON ut.idTeam = t.id WHERE u.username = ?`

    return this.dao.all(sql, [username])
  }

  readAllUsers() {
    const sql = 'SELECT * FROM users'
    return this.dao.all(sql, [])
  }

  readAvailableUsers() {
    const sql = 'SELECT * FROM users WHERE active = 0'
    return this.dao.all(sql, [])
  }
}

module.exports = UserRepository