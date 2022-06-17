module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { amaraDeployer } = await getNamedAccounts();

  console.log("Deploying FCFSTAA.sol smart contract")

  // Deploy FCFSTAA.sol from fcfsDeployer in Rinkeby, saved to deployments->rinkeby
  await deploy("FCFSTAA", {
    from: amaraDeployer,
    gasLimit: 4000000,
    // High gas price to avoid failling txs
    // gasPrice: 2000000000,
    args: [],
  });

  const {  } = await getNamedAccounts();

};
