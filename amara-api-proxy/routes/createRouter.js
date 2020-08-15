const glob = require('glob')
const Router = require('express').Router

/* Every /api/something call will be redirected to rootRouter, 
and the rootRouter will redirect the call to the child router 
 /something */
module.exports = () =>
  glob
    /* Returns an array with all the js extension files inside __dirname */
    .sync('**/*.js', { cwd: `${__dirname}/` })
    /* Returns an array with all the objects imported from those files. */
    .map(filename => require(`./${filename}`))
    /* Get only those objects which are an instance of Router */
    .filter(router => Object.getPrototypeOf(router) === Router)
    /* Add every router to a rootRouter */
    .reduce(
      (rootRouter, router) => rootRouter.use(router),
      Router({ mergeParams: true })
    )
