require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  namedAccounts: {
    amaraDeployer: {
      default: 0,
      4: process.env.AMARA_PUBLIC_KEY, // Rinkeby
    },
  },
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [process.env.AMARA_PRIVATE_KEY],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [process.env.AMARA_PRIVATE_KEY],
    },
  },
  paths: {
    deploy: "deploy",
    deployments: "deployments",
  },
};
