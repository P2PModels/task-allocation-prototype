# Task allocation amara proxy api

A Node.js server to connect to Amara API so we can avoid CORS policy.

You need to connect this server to the task allocation aragon app.

## Set up

Git clone this repo 

```sh
git clone https://github.com/P2PModels/task-allocation-prototype.git
```

Navigate into the `amara-api-proxy` directory 

```sh
cd amara-api-proxy
```

Install npm dependencies

```sh
npm i
```

Start the server 

```sh
npm start
```

The server will be publicly-accesible through a ngrok url.

## Resources

[Amara API documentation](https://apidocs.amara.org/#authentication)