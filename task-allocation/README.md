# Task Allocation App

Task allocation aragon app.

## Permissions

The following table contains all the permissions available for this app: 

| Permissions      | Description          |
| :--------------- | :------------------- |
| ASSIGN_TASK_ROLE | Assign an Amara task |



## Special "admin" account

The prototype uses the following default testing account as some sort of admin account so you can configure the prototype and set up the url from where the proxy api  is being served so you can connect to the Amara API 

Once you select the account in Metamask a special config dashboard will show up at the bottom of the app 

<u>Account:</u>

**private key**: `0x6b12b45143fc6c7721d0ffbb9811905e773868376501fd1f46c64bf34ae29991`
**public key**: `0x27E9727FD9b8CdDdd0854F56712AD9DF647FaB74`

You can change the default admin account by assigning a new address to the `ADMIN_ADDRESS` variable located in the `amara-utils.js` file inside the `lib` folder. 



## How to try Task Allocation immediately

[Here](https://rinkeby.aragon.org/#/amaraprototype/0x9a841bb308422e20e35d5a2fd83dd8b59751dab4/)
 you can get access to a Task Allocation demo DAO live on Rinkeby! 

Keep in mind you still need to set up the Amara api proxy server to try out the prototype. 

## How to run Task Allocation locally

First make sure that you have node, npm, and the Aragon CLI installed and working. 

Instructions on how to set that up can be found [here](https://hack.aragon.org/docs/cli-intro.html). 

You'll also need to have [Metamask](https://metamask.io) or some kind of web wallet enabled to sign transactions in the browser.

Navigate into the `task-allocation` directory

```sh
cd task-allocation
```

Install npm dependencies

```sh
npm i
```

Deploy a dao with Task Allocation installed on your local environment. This will execute the `aragon buidler` which will set up everything for you.

```sh
npm start
```

You will see the configuration for your local deployment in the terminal. The last terminal lines show you the url  where the aragon client is being served. It should look something like this: 

```sh
...
frontend | Client:  http://localhost:3000/#/<dao-address>
Ready for changes
```

Copy paste the link in your browser and you're all set !.



## How to deploy Task Allocation to an existing organization 

Task Allocation has been published to APM on rinkeby at `tasks-allocation.open.aragonpm.eth`

To deploy to an organization you can use the [Aragon CLI](https://hack.aragon.org/docs/cli-intro.html).

```sh
aragon dao install <dao-address> tasks-allocation.open.aragonpm.eth --environment aragon:<network>
```

`network` can be `local`, `rinkeby` or `mainnet`.

After the app instance is created, you will need to assign permissions to it for it to appear as an app in the DAO. 

To assign permissions to the new installed app we will need the app's proxy address which we can get by executing the following command: 

```sh
dao apps <dao-address> -all --enviroment aragon:rinkeby
```

You should see a list of apps, and freshly installed apps will be listed at the bottom, in the "permissionless apps" section, in the order in which they were installed.

Once you have the proxy address, we can create the new permission. We recommend assigning `ASSIGN_TASK_ROLE`  permission to `ANY_ENTITY`  which is represented by the following address: `0xffffffffffffffffffffffffffffffffffffffff`.

```sh
aragon dao acl create <dao-address> <task-allocation-address> ASSIGN_TASK_ROLE 0xffffffffffffffffffffffffffffffffffffffff <permission-manager-address> --environment aragon:<network>
```

Read more about acl commands [here](https://hack.aragon.org/docs/cli-dao-commands#dao-acl-create).

After creating the permission you should see your newly installed app on your dao! 

## Structure

This app has the following structure:

```md
root
├── app
├ ├── assets
├ ├── public
├ ├── src
├  └── amara-api
├  └── components
├  └── lib
├  └── screens
├ ├── package.json
├── contracts
├ └── TaskAllocationApp.sol
├── test
├── arapp.json
├── manifest.json
├── buidler.config.js
└── package.json
```

- **app**: Frontend folder. Completely encapsulated: has its own package.json and dependencies.
  - **assets**: Image files.
  - **public**: App icon, screenshots, details, etc... 
  - **src**: Source files.
    - **amara-api**: API proxy data access files.
    - **components**: App components files
    - **lib**: Helper files.
    - **screens**: App main view components.
  - [**package.json**](https://docs.npmjs.com/creating-a-package-json-file): Frontend npm configuration file.
- **contracts**: Smart contracts folder.
  - `TaskAllocationApp.sol`: Task Allocation app contract.
- **test**: Tests folder.
- [**arapp.json**](https://hack.aragon.org/docs/cli-global-confg#the-arappjson-file): Aragon configuration file. Includes Aragon-specific metadata for your app.
- [**manifest.json**](https://hack.aragon.org/docs/cli-global-confg#the-manifestjson-file): Aragon configuration file. Includes web-specific configuration.
- [**buidler.config.js**](https://buidler.dev/config/): Buidler configuration file.
- [**package.json**](https://docs.npmjs.com/creating-a-package-json-file): Main npm configuration file.

### Libraries

- [**@aragon/os**](https://github.com/aragon/aragonos): AragonApp smart contract interfaces.
- [**@aragon/api**](https://github.com/aragon/aragon.js/tree/master/packages/aragon-api): Aragon client application API.
- [**@aragon/ui**](https://github.com/aragon/aragon-ui): Aragon UI components (in React).
- [**@aragon/buidler-aragon**](https://github.com/aragon/buidler-aragon): Aragon Buidler plugin.


