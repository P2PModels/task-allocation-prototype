# Task Allocation App

Task allocation aragon app. 

## How to run Task Allocation locally

First make sure that you have node, npm, and the Aragon CLI installed and working. Instructions on how to set that up can be found [here](https://hack.aragon.org/docs/cli-intro.html). You'll also need to have [Metamask](https://metamask.io) or some kind of web wallet enabled to sign transactions in the browser.

Git clone this repo.

```sh
git clone https://github.com/P2PModels/task-allocation-prototype.git
```

Navigate into the `task-allocation` directory

```sh
cd task-allocation
```

Install npm dependencies

```sh
npm i
```

Deploy a dao with Task Allocation installed on your local environment. This will execute `aragon buidler` which will set up everything for you.

```sh
npm start
```

You will see the configuration for your local deployment in the terminal. The final terminal lines show you the url  where the aragon client is being served. It should look something like this: 

```sh
...
frontend | Client:  http://localhost:3000/#/<DAO_ADDRESS>
Ready for changes
```

Copy paste the link in your browser and you're all set !.

## Permissions

The following table contains all the permissions available for this app: 

| Permissions      | Description          |
| :--------------- | :------------------- |
| ASSIGN_TASK_ROLE | Assign an Amara task |

## How to deploy Task Allocation to an existing organization 

Task Allocation has been published to APM on rinkeby at `task-allocation.open.aragonpm.eth`

To deploy to an organization you can use the [Aragon CLI](https://hack.aragon.org/docs/cli-intro.html).

```sh
aragon dao install <dao-address> task-allocation.open.aragonpm.eth --environment aragon:<network>
```

`network` can be `local`, `rinkeby` or `mainnet`.

After the app instance is created, you will need to assign permissions to it for it appear as an app in the DAO. 

To assign permissions to the new installed app we will need the app's proxy address, we can get it executing the following command: 

```sh
dao apps <dao> -all
```

You should see a list of apps, and freshly installed apps will be listed at the bottom, in the "permissionless apps" section, in the order in which they were installed.

Once you have the proxy address, we can create the new permission. Try assigning `ASSIGN_TASK_ROLE` to an entity of your choice (e.g. `Voting` app)

```sh
aragon dao acl create <dao-address> <task-allocation-address> ASSIGN_TASK_ROLE <task-allocation-address> <voting> --environment aragon:<network>
```

Read more about acl commands [here](https://hack.aragon.org/docs/cli-dao-commands#dao-acl-create).

## Structure

This boilerplate has the following structure:

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
├ └── CounterApp.sol
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


