module.exports = function queryParamsHandler(req, res, next) {
  /* Build query parameters */
  if (req.query && Object.keys(req.query).length)
    req.queryParams = Object.keys(req.query).reduce(
      (queryParams, param, index) => {
        return (queryParams +=
          (index > 0 ? `&` : ``) + `${param}=${req.query[param]}`)
      },
      `?`
    )
  else req.queryParams = ``
  next()
}
