const glob = require('glob')

module.exports = () => glob
    .sync('**/*.middleware.js', { cwd: `${__dirname}/`})
    .reduce((middlewares, filename) => {
        const middleware = require(`./${filename}`)
        middlewares[middleware.name] = middleware
        return middlewares
    }, {})