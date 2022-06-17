const { expect, fail } = require("chai");
const { team, users, reallicationtimes, tasks } = require("./helpers/mock-data");
const { formatBytes32String } = require('ethers/lib/utils')

describe("FCFSTAA contract", function () {
  let owner;

  let fcfsTAAContract;
  let fcfsTAADeploy;
  let fcfsTAAInstance;

  before(async function () {
    // Save account addresses once to use in each test
    const accounts = await ethers.getSigners();
    owner = accounts[0];
  });

  // Before each 'it'
  beforeEach(async function () {
    // Deploy fresh contract before each test
    fcfsTAAContract = await ethers.getContractFactory("FCFSTAA");
    fcfsTAADeploy = await fcfsTAAContract.deploy();
    await fcfsTAADeploy.deployed();

    // Conect to an account
    fcfsTAAInstance = await fcfsTAADeploy.connect(owner);
  });
  
  describe("Register user", function () {

    it(`Should register the user ${users[0]} and emit a user registered event`, async function () {
      await expect(
        fcfsTAAInstance.registerUser(formatBytes32String(users[0]))
      )
        .to.emit(fcfsTAAInstance, "UserRegistered")
        .withArgs(formatBytes32String(users[0]));
    });

    it(`Should reject registering an existing user ${users[0]}`, async function () {

      await fcfsTAAInstance.registerUser(formatBytes32String(users[0]))

      try {
        await fcfsTAAInstance.registerUser(formatBytes32String(users[0]))
      } catch (e){
        expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'USER_ALREADY_EXISTS'");
      }
    });
  
  });

  describe("Register task", function() {

    it(`Should create a task ${tasks[0].job_id} and emit a task created event`, async function () {
      await expect(
        fcfsTAAInstance.createTask(formatBytes32String(tasks[0].job_id))
      )
        .to.emit(fcfsTAAInstance, "TaskCreated")
        .withArgs(formatBytes32String(tasks[0].job_id));
    });

    it(`Should reject registering an existing task ${tasks[0].job_id}`, async function () {
      
      await fcfsTAAInstance.createTask(formatBytes32String(tasks[0].job_id))
      
      try {
        await fcfsTAAInstance.createTask(formatBytes32String(tasks[0].job_id))
      } catch (e){
        expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'TASK_EXISTS'");
      }
    });

  });

  describe("Assign task to user", function() {

    it(`Should assign task ${tasks[0].job_id} to user ${users[0]} and emit a task accepted event`, async function () {
      
      await fcfsTAAInstance.registerUser(formatBytes32String(users[0]))
      await fcfsTAAInstance.createTask(formatBytes32String(tasks[0].job_id))
      
      await expect(
        fcfsTAAInstance.acceptTask(formatBytes32String(users[0]),formatBytes32String(tasks[0].job_id))
      )
        .to.emit(fcfsTAAInstance, "TaskAccepted")
        .withArgs(formatBytes32String(users[0]),formatBytes32String(tasks[0].job_id));
    });

    it(`Should reject assigning a task ${tasks[0].job_id} to unregistered user ${users[0]}`, async function () {
      
      await fcfsTAAInstance.createTask(formatBytes32String(tasks[0].job_id))
      
      try {
        await fcfsTAAInstance.acceptTask(formatBytes32String(users[0]),formatBytes32String(tasks[0].job_id))
      } catch (e){
        expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'USER_DONT_EXIST'");
      }
    });

    it(`Should reject assigning an unregistered task ${tasks[0].job_id} to user ${users[0]}`, async function () {
      
      await fcfsTAAInstance.registerUser(formatBytes32String(users[0]))

      try {
        await fcfsTAAInstance.acceptTask(formatBytes32String(users[0]),formatBytes32String(tasks[0].job_id))
      } catch (e){
        expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'TASK_DONT_EXIST'");
      }
    });

    it(`Should reject assigning a not available task ${tasks[0].job_id} to user ${users[0]}`, async function () {
      
      await fcfsTAAInstance.registerUser(formatBytes32String(users[0]))
      await fcfsTAAInstance.registerUser(formatBytes32String(users[1]))
      await fcfsTAAInstance.createTask(formatBytes32String(tasks[0].job_id))
      await fcfsTAAInstance.acceptTask(formatBytes32String(users[0]),formatBytes32String(tasks[0].job_id))

      try {
        await fcfsTAAInstance.acceptTask(formatBytes32String(users[1]),formatBytes32String(tasks[0].job_id))
      } catch (e){
        expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'TASK_NOT_AVAILABLE'");
      }
    });

    it(`Should reject assigning a task ${tasks[0].job_id} to a user ${users[0]} which already has a task`, async function () {
      
      await fcfsTAAInstance.registerUser(formatBytes32String(users[0]))
      await fcfsTAAInstance.createTask(formatBytes32String(tasks[0].job_id))
      await fcfsTAAInstance.acceptTask(formatBytes32String(users[0]),formatBytes32String(tasks[0].job_id))
      await fcfsTAAInstance.createTask(formatBytes32String(tasks[1].job_id))

      try {
        await fcfsTAAInstance.acceptTask(formatBytes32String(users[0]),formatBytes32String(tasks[1].job_id))
      } catch (e){
        expect(e.message).to.equal("VM Exception while processing transaction: reverted with reason string 'USER_HAS_TASK'");
      }
    });

  });

  describe("Restart contract", function() {
    
    it(`Should restart the contract and emit a task ${tasks[0].job_id} deleted event`, async function () {
      users.forEach(async (user,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.registerUser(formatBytes32String(user))
      });

      tasks.forEach(async (task,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.createTask(formatBytes32String(task.job_id))
      });

      await expect(
        fcfsTAAInstance.restart()
      )
        .to.emit(fcfsTAAInstance, "TaskDeleted").withArgs(formatBytes32String(tasks[0].job_id));
    });

    it(`Should restart the contract and emit a user ${users[0]} deleted event`, async function () {
      users.forEach(async (user,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.registerUser(formatBytes32String(user))

      });

      tasks.forEach(async (task,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.createTask(formatBytes32String(task.job_id))
      });

      await expect(
        fcfsTAAInstance.restart()
      )
        .to.emit(fcfsTAAInstance, "UserDeleted").withArgs(formatBytes32String(users[0]));
    });
  
    it(`Should restart the contract and emit a tasks restart event`, async function () {
      users.forEach(async (user,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.registerUser(formatBytes32String(user))

      });

      tasks.forEach(async (task,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.createTask(formatBytes32String(task.job_id))
      });

      await expect(
        fcfsTAAInstance.restart()
      )
        .to.emit(fcfsTAAInstance, "TasksRestart").withArgs(owner.address);
    });

    it(`Should create a task after contract restart`, async function () {
      users.forEach(async (user,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.registerUser(formatBytes32String(user))

      });

      tasks.forEach(async (task,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.createTask(formatBytes32String(task.job_id))
      });
  
      await fcfsTAAInstance.restart()

      await expect(
        fcfsTAAInstance.createTask(formatBytes32String(tasks[0].job_id))
      )
        .to.emit(fcfsTAAInstance, "TaskCreated")
        .withArgs(formatBytes32String(tasks[0].job_id));
    });

    it(`Should register a user after contract restart`, async function () {
      users.forEach(async (user,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.registerUser(formatBytes32String(user))

      });

      tasks.forEach(async (task,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.createTask(formatBytes32String(task.job_id))
      });
  
      await fcfsTAAInstance.restart()

      await expect(
        fcfsTAAInstance.registerUser(formatBytes32String(users[0]))
      )
        .to.emit(fcfsTAAInstance, "UserRegistered")
        .withArgs(formatBytes32String(users[0]));
    });

    it(`Should assign task ${tasks[0].job_id} to user ${users[0]} and emit a task accepted event after contract restart`, async function () {
      users.forEach(async (user,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.registerUser(formatBytes32String(user))

      });

      tasks.forEach(async (task,i) => {
        if(i >= 3) return
        await fcfsTAAInstance.createTask(formatBytes32String(task.job_id))
      });
  
      await fcfsTAAInstance.restart()
      await fcfsTAAInstance.registerUser(formatBytes32String(users[0]))
      await fcfsTAAInstance.createTask(formatBytes32String(tasks[0].job_id))

      await expect(
        fcfsTAAInstance.acceptTask(formatBytes32String(users[0]),formatBytes32String(tasks[0].job_id))
      )
        .to.emit(fcfsTAAInstance, "TaskAccepted")
        .withArgs(formatBytes32String(users[0]),formatBytes32String(tasks[0].job_id));
    });

  });

});


