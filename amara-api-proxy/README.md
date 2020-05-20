# Amara Proxy API

A Node.js server to connect to Amara API so we can avoid CORS policy. 

The local server is publicly-exposed to the Internet by using [ngrok](https://ngrok.com/) 

## Set up

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

After running the command you will see in the terminal  a ngrok url  from where the proxy api is being served.

## Structure

This proxy api has the following structure:

```md
root
├ ├── middlewares
├ ├── models
├  └── schemes
├    └── amara-users.db
├ ├── routes
├── utils
└── package.json
```

- **middlewares**: Custom middlewares folder.

- **models**: Object models folder.

- **schemes** Schemes directory containing the database 

  - **amara-users.db**: sqlite database with amara demo user accounts to try out the prototype.

- **routes**: Routes folder connecting to Amara API or sqlite user database. 

- **utils**: Helper files.

- [**package.json**](https://docs.npmjs.com/creating-a-package-json-file): Main npm configuration file.

  

## Resources

[Amara API documentation](https://apidocs.amara.org/#authentication)