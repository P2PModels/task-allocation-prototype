class UserRepository {
  constructor(dao) {
    this.dao = dao
  }

  updateUser(id, active) {
    const sql = `UPDATE users SET active = ? WHERE id = ?`

    return new Promise((resolve, reject) => {
      this.dao.run(sql, [active, id], err => {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  }

  readUserTeams(username) {
    const sql = `SELECT t.name FROM users u INNER JOIN user_team ut 
    on u.id = ut.idUser INNER JOIN teams t ON ut.idTeam = t.id WHERE u.username = ?`

    return this.dao.all(sql, [username])
  }

  readUserLanguages(id) {
    const sql = `SELECT l.code FROM users u INNER JOIN user_language ul ON u.id = ul.idUser INNER JOIN languages l ON ul.idLanguage = l.id WHERE u.id = ?`

    return this.dao.all(sql, [id])
  }

  async readUser(username) {
    const sql = 'SELECT * FROM users u WHERE u.username = ?'
    let user

    const res = await this.dao.all(sql, [username])
    if (res && res.length) {
      user = res[0]
      const teams = await this.readUserTeams(username)
      const languages = await this.readUserLanguages(user.id)
      user.teams = teams
      user.languages = languages
    } else user = {}

    return user
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
