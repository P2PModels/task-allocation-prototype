module.exports = function errorHandler(error, req, res, next) {
    res.status(error.status || 500).json({ error })
}
