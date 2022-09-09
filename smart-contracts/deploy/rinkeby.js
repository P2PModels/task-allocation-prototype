async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contract Round Robin + cal with the account:",
    deployer.address
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const RoundRobinCalTAA = await ethers.getContractFactory("RoundRobinCalTAA");
  const RoundRobinCalTAAInstance = await RoundRobinCalTAA.deploy();

  console.log("Contract address:", RoundRobinCalTAAInstance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
