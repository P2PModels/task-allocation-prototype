async function main() {
  const [deployer] = await ethers.getSigners();


  console.log(
    "Deploying contract Round Robin + cal with the account:",
    deployer.address
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contract = await ethers.getContractFactory("RoundRobinCalTAA");
  const contractInstance = await contract.deploy();

  console.log("Contract address:", contractInstance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
