class RatingRepository {
  constructor(dao) {
    this.dao = dao
  }

  createRating(userId, date, score) {
    const sql = `INSERT INTO ratings(idUser, date, score) VALUES (?, ?, ?)`
    return new Promise((resolve, reject) => {
      this.dao.run(sql, [userId, date, score], err => {
        if(err)
          reject(err)
        else
          resolve(1)
      })
    })
  }
}

module.exports = RatingRepository