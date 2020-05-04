const ngrok = require('ngrok')

const app = require('./createExpressApp')()
const port = process.env.PORT || 5000

app.listen(port, err => {
  if(err)
    console.log(`Couldn't run server. ${err.message}`);
  else {
    console.log(`Server listening on port ${port}`);

    ngrok.connect(port).then(
      url => console.log(`Server is publicly-accesible at ${url}`),
      err => console.log('Error trying to initialize ngrok', err)
    )

  }
})

