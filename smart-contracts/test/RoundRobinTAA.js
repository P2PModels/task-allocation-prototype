const { expect, fail } = require("chai");
const { team, users, reallicationtimes, tasks } = require("./helpers/mock-data");
const { formatBytes32String } = require('ethers/lib/utils')

describe("RoundRobinTAA contract", function () {
  let owner;

  let roundRobinTAAContract;
  let roundRobinTAADeploy;
  let roundRobinTAAInstance;

  before(async function () {
    // Save account addresses once to use in each test
    const accounts = await ethers.getSigners();
    owner = accounts[0];
  });

  // Before each 'it'
  beforeEach(async function () {
    // Deploy fresh contract before each test
    roundRobinTAAContract = await ethers.getContractFactory("RoundRobinTAA");
    roundRobinTAADeploy = await roundRobinTAAContract.deploy();
    await roundRobinTAADeploy.deployed();

    // Conect to an account
    roundRobinTAAInstance = await roundRobinTAADeploy.connect(owner);
  });
  
  describe("Register users", function () {

    it(`Should emit a user registered event for user ${users[0]}`, async function () {
      await expect(
        roundRobinTAAInstance.registerUser(formatBytes32String(users[0]))
      )
        .to.emit(roundRobinTAAInstance, "UserRegistered")
        .withArgs(formatBytes32String(users[0]));
    });

    it(`Should reject registering an existing user ${users[0]}`, async function () {

      // Register user
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]))

      // Try to register same user again
      try {
        await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]))
      } catch (e){
        expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'USER_ALREADY_EXISTS'");
      }
    });

    // users.forEach(user => {
    //   it(`Should emit a user registered event for user ${user}`, async function () {
    //     await expect(
    //       roundRobinTAAInstance.registerUser(formatBytes32String(user))
    //     )
    //       .to.emit(roundRobinTAAInstance, "UserRegistered")
    //       .withArgs(formatBytes32String(user));
    //   });
    // });
  
  });
});
