# Task allocation prototype

Aragon application prototype designed to allocate Amara's subtitle tasks in a decentralized manner and distribute them among the Amara linguists

This repo has two folders  which contain the task allocation aragon app and a proxy api to connect to Amara in order to retrieve the tasks. Both folders have their own README files so you should take a look at them. 

## Set up

Git clone this repo

```sh
git clone https://github.com/P2PModels/committees.git
```

Set up the aragon app bu following the README installation instructions section contained in the `task-allocation` folder

Set up the proxy api by following the README  installation instructions section contained in the `amara-api-proxy` folder 

Once you have both projects running, you need to select the [admin account](https://github.com/P2PModels/task-allocation-prototype/tree/develop/task-allocation#special-admin-account) in Metamask 

A dashboard will show up at the bottom of the aragon app. 

You need to copy and paste the ngrok api and press the button. This will prompt a transaction to metamask to store the url in the app's contract so everyone can connect to the api.
