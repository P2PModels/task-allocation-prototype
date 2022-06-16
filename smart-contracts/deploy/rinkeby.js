module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying smart contract")
  console.log(deploy.prototype)

  // Deploy RoundRobinTAA.sol from deployer in Rinkeby, saved to deployments->rinkeby
  await deploy("RoundRobinTAA", {
    from: deployer,
    gasLimit: 4000000,
    // High gas price to avoid failling txs
    // gasPrice: 2000000000,
    args: [],
  });
};
