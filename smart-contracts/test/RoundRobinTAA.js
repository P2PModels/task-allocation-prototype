const { expect } = require("chai");
const { users, tasks } = require("./helpers/mock-data");
const { formatBytes32String } = require("ethers/lib/utils");

const REALLOCATION_TIME = 300;

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
    it(`Should register the user ${users[0]} and emit a user registered event`, async function () {
      await expect(
        roundRobinTAAInstance.registerUser(formatBytes32String(users[0]))
      )
        .to.emit(roundRobinTAAInstance, "UserRegistered")
        .withArgs(formatBytes32String(users[0]));
    });

    it(`Should reject registering an existing user ${users[0]}`, async function () {
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));

      try {
        await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'USER_ALREADY_EXISTS'"
        );
      }
    });
  });

  describe("Register task", function () {
    it(`Should create a task ${tasks[0].job_id} and emit a task created event`, async function () {
      await expect(
        roundRobinTAAInstance.createTask(
          formatBytes32String(tasks[0].job_id),
          REALLOCATION_TIME
        )
      )
        .to.emit(roundRobinTAAInstance, "TaskCreated")
        .withArgs(formatBytes32String(tasks[0].job_id));
    });

    it(`Should reject registering an existing task ${tasks[0].job_id}`, async function () {
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinTAAInstance.createTask(
          formatBytes32String(tasks[0].job_id),
          REALLOCATION_TIME
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TASK_EXISTS'"
        );
      }
    });
  });

  describe("Allocate task", function () {
    it(`Should allocate task ${tasks[0].job_id} to user ${users[0]} and emit a task allocated event`, async function () {
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      await expect(
        roundRobinTAAInstance.allocateTask(
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(users[0])
        )
      )
        .to.emit(roundRobinTAAInstance, "TaskAllocated")
        .withArgs(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(0)
        );
    });

    it(`Should reject allocating a task ${tasks[0].job_id} to an unregistered user ${users[0]}`, async function () {
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        roundRobinTAAInstance.allocateTask(
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(users[0])
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'USER_DONT_EXIST'"
        );
      }
    });

    it(`Should reject allocating a non existing task ${tasks[0].job_id} to user ${users[0]}`, async function () {
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));

      try {
        roundRobinTAAInstance.allocateTask(
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(users[0])
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TASK_DONT_EXIST'"
        );
      }
    });

    it(`Should reject allocating task ${tasks[1].job_id} to user ${users[0]} which already has a task asigned`, async function () {
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );
      await roundRobinTAAInstance.allocateTask(
        formatBytes32String(tasks[0].job_id),
        formatBytes32String(users[0])
      );
      await roundRobinTAAInstance.acceptTask(
        formatBytes32String(users[0]),
        formatBytes32String(tasks[0].job_id)
      );

      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[1].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinTAAInstance.allocateTask(
          formatBytes32String(tasks[1].job_id),
          formatBytes32String(users[0])
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TASK_ALLOCATION_FAIL'"
        );
      }
    });
    it(`Should reject allocating another task to user ${users[0]} which already have max number of task asigned`, async function () {
      let maxNumOfTasks = 3;
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));

      for (let i = 0; i < maxNumOfTasks; i++) {
        await roundRobinTAAInstance.createTask(
          formatBytes32String(tasks[i].job_id),
          REALLOCATION_TIME
        );
        await roundRobinTAAInstance.allocateTask(
          formatBytes32String(tasks[i].job_id),
          formatBytes32String(users[0])
        );
      }

      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[maxNumOfTasks].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinTAAInstance.allocateTask(
          formatBytes32String(tasks[maxNumOfTasks].job_id),
          formatBytes32String(users[0])
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'USER_HAS_TOO_MANY_TASKS'"
        );
      }
    });
  });

  describe("Accept task", function () {
    it(`Should assign task ${tasks[0].job_id} to user ${users[0]} and emit a task accepted event`, async function () {
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );
      await roundRobinTAAInstance.allocateTask(
        formatBytes32String(tasks[0].job_id),
        formatBytes32String(users[0])
      );

      await expect(
        roundRobinTAAInstance.acceptTask(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        )
      )
        .to.emit(roundRobinTAAInstance, "TaskAccepted")
        .withArgs(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        );
    });

    it(`Should reject assigning a task ${tasks[0].job_id} to an unregistered user ${users[0]}`, async function () {
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinTAAInstance.acceptTask(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'USER_DONT_EXIST'"
        );
      }
    });

    it(`Should reject assigning a task ${tasks[0].job_id} not allocated to user ${users[0]}`, async function () {
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinTAAInstance.acceptTask(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TASK_NOT_ASSIGNED_TO_USER'"
        );
      }
    });
  });

  describe("Reject task", function () {
    it(`Should reject task ${tasks[0].job_id} allocated to user ${users[0]} and emit a task rejected event`, async function () {
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );
      await roundRobinTAAInstance.allocateTask(
        formatBytes32String(tasks[0].job_id),
        formatBytes32String(users[0])
      );

      await expect(
        roundRobinTAAInstance.rejectTask(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        )
      )
        .to.emit(roundRobinTAAInstance, "TaskRejected")
        .withArgs(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        );
    });

    it(`Should reject rejecting a task ${tasks[0].job_id} to an unregistered user ${users[0]}`, async function () {
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinTAAInstance.rejectTask(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'USER_DONT_EXIST'"
        );
      }
    });

    it(`Should reject rejecting a task ${tasks[0].job_id} not allocated to user ${users[0]}`, async function () {
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));
      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinTAAInstance.rejectTask(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TASK_NOT_ASSIGNED_TO_USER'"
        );
      }
    });
  });

  describe("Reallocate task", function () {
    it(`Should reallocate task ${tasks[0].job_id} from user ${users[0]} to user ${users[1]} and emit a task allocated event`, async function () {
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[0]));
      await roundRobinTAAInstance.registerUser(formatBytes32String(users[1]));

      await roundRobinTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );
      await roundRobinTAAInstance.allocateTask(
        formatBytes32String(tasks[0].job_id),
        formatBytes32String(users[0])
      );

      let timestamp = Date.now();
      let currentTimestamp = Date.now();
      while (currentTimestamp < timestamp + REALLOCATION_TIME) {
        currentTimestamp = Date.now();
      }

      await expect(
        roundRobinTAAInstance.reallocateTask(
          formatBytes32String(tasks[0].job_id)
        )
      )
        .to.emit(roundRobinTAAInstance, "TaskAllocated")
        .withArgs(
          formatBytes32String(users[1]),
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(users[0])
        );
    });

    it(`Should reject reallocating a non existing task ${tasks[0].job_id}`, async function () {
      try {
        await roundRobinTAAInstance.reallocateTask(
          formatBytes32String(tasks[0].job_id)
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TASK_DONT_EXIST'"
        );
      }
    });
  });
});
