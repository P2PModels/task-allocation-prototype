const { expect } = require("chai");
const { users, tasks } = require("./helpers/mock-data");
const { formatBytes32String } = require("ethers/lib/utils");

const REALLOCATION_TIME = 300;

describe("RoundRobinCalTAA contract", function () {
  let owner;

  let roundRobinCalTAAContract;
  let roundRobinCalTAADeploy;
  let roundRobinCalTAAInstance;

  before(async function () {
    // Save account addresses once to use in each test
    const accounts = await ethers.getSigners();
    owner = accounts[0];
  });

  // Before each 'it'
  beforeEach(async function () {
    // Deploy fresh contract before each test
    roundRobinCalTAAContract = await ethers.getContractFactory(
      "RoundRobinCalTAA"
    );
    roundRobinCalTAADeploy = await roundRobinCalTAAContract.deploy();
    await roundRobinCalTAADeploy.deployed();

    // Conect to an account
    roundRobinCalTAAInstance = await roundRobinCalTAADeploy.connect(owner);
  });

  describe("Register users", function () {
    it(`Should register the user ${users[0]} and emit a user registered event`, async function () {
      await expect(
        roundRobinCalTAAInstance.registerUser(formatBytes32String(users[0]))
      )
        .to.emit(roundRobinCalTAAInstance, "UserRegistered")
        .withArgs(formatBytes32String(users[0]));
    });

    it(`Should reject registering an existing user ${users[0]}`, async function () {
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      try {
        await roundRobinCalTAAInstance.registerUser(
          formatBytes32String(users[0])
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'USER_ALREADY_EXISTS'"
        );
      }
    });
  });

  describe("Set users availability calendar", function () {
    it(`Should register the user ${users[0]} availability calendar and emit a user calendar updated event`, async function () {
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      calendar.push([nowInS, nowInS + 3600 * 2]); // Range now to 1h
      calendar.push([nowInS + 3600 * 2, nowInS + 3600 * 3]);
      calendar.push([nowInS + 3600 * 4, nowInS + 3600 * 6]);

      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      await expect(
        roundRobinCalTAAInstance.setUserCalendarRanges(
          formatBytes32String(users[0]),
          calendar
        )
      )
        .to.emit(roundRobinCalTAAInstance, "UserCalendarUpdated")
        .withArgs(formatBytes32String(users[0]));
    });

    // Maximum time in the past 24h
    it(`Should reject adding past time ranges to user ${users[0]} calendar`, async function () {
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      // Wrong time ranges, all from the past
      calendar.push([nowInS - 3600 * 48, nowInS]); // Range now to 1h
      calendar.push([nowInS - 3600 * 3, nowInS - 3600 * 2]);
      calendar.push([nowInS - 3600 * 6, nowInS - 3600 * 4]);

      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      try {
        await roundRobinCalTAAInstance.setUserCalendarRanges(
          formatBytes32String(users[0]),
          calendar
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'PAST_TIME_RANGE'"
        );
      }
    });

    it(`Should reject adding invalid time ranges to user ${users[0]} calendar`, async function () {
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      // Wrong time ranges, start is bigger than end
      calendar.push([nowInS + 3600, nowInS]); // Range now to 1h
      calendar.push([nowInS + 3600 * 3, nowInS + 3600 * 2]);
      calendar.push([nowInS + 3600 * 6, nowInS + 3600 * 4]);

      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      try {
        await roundRobinCalTAAInstance.setUserCalendarRanges(
          formatBytes32String(users[0]),
          calendar
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'INVALID_TIME_RANGE'"
        );
      }
    });

    it(`Should reject adding, to user ${users[0]} calendar, not increasingly ordered time ranges`, async function () {
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      // Wrong time ranges, not properly ordered
      calendar.push([nowInS + 3600 * 2, nowInS + 3600 * 3]);
      calendar.push([nowInS + 3600 * 4, nowInS + 3600 * 6]);
      calendar.push([nowInS, nowInS + 3600]); // Range now to 1h

      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      try {
        await roundRobinCalTAAInstance.setUserCalendarRanges(
          formatBytes32String(users[0]),
          calendar
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TIME_RANGES_NOT_INCREASINGLY_ORDERED'"
        );
      }
    });
  });

  describe("Register task", function () {
    it(`Should create a task ${tasks[0].job_id} and emit a task created event`, async function () {
      await expect(
        roundRobinCalTAAInstance.createTask(
          formatBytes32String(tasks[0].job_id),
          REALLOCATION_TIME
        )
      )
        .to.emit(roundRobinCalTAAInstance, "TaskCreated")
        .withArgs(formatBytes32String(tasks[0].job_id));
    });

    it(`Should reject registering an existing task ${tasks[0].job_id}`, async function () {
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinCalTAAInstance.createTask(
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
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      calendar.push([nowInS, nowInS + 3600 * 2]); // Range now to 1h
      calendar.push([nowInS + 3600 * 2, nowInS + 3600 * 3]);
      calendar.push([nowInS + 3600 * 4, nowInS + 3600 * 6]);
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendar
      );
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      await expect(
        roundRobinCalTAAInstance.allocateTask(
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(users[0])
        )
      )
        .to.emit(roundRobinCalTAAInstance, "TaskAllocated")
        .withArgs(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(0)
        );
    });

    it(`Should reject allocating a task ${tasks[0].job_id} to an unregistered user ${users[0]}`, async function () {
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        roundRobinCalTAAInstance.allocateTask(
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
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      try {
        roundRobinCalTAAInstance.allocateTask(
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(users[0])
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TASK_DONT_EXIST'"
        );
      }
    });

    it(`Should reject allocating task ${tasks[1].job_id} to user ${users[0]} which already has a task accepted`, async function () {
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      calendar.push([nowInS, nowInS + 3600 * 2]); // Range now to 1h
      calendar.push([nowInS + 3600 * 2, nowInS + 3600 * 3]);
      calendar.push([nowInS + 3600 * 4, nowInS + 3600 * 6]);
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendar
      );
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );
      await roundRobinCalTAAInstance.allocateTask(
        formatBytes32String(tasks[0].job_id),
        formatBytes32String(users[0])
      );
      await roundRobinCalTAAInstance.acceptTask(
        formatBytes32String(users[0]),
        formatBytes32String(tasks[0].job_id)
      );

      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[1].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinCalTAAInstance.allocateTask(
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
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      calendar.push([nowInS, nowInS + 3600 * 2]); // Range now to 1h
      calendar.push([nowInS + 3600 * 2, nowInS + 3600 * 3]);
      calendar.push([nowInS + 3600 * 4, nowInS + 3600 * 6]);
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendar
      );

      for (let i = 0; i < maxNumOfTasks; i++) {
        await roundRobinCalTAAInstance.createTask(
          formatBytes32String(tasks[i].job_id),
          REALLOCATION_TIME
        );
        await roundRobinCalTAAInstance.allocateTask(
          formatBytes32String(tasks[i].job_id),
          formatBytes32String(users[0])
        );
      }

      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[maxNumOfTasks].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinCalTAAInstance.allocateTask(
          formatBytes32String(tasks[maxNumOfTasks].job_id),
          formatBytes32String(users[0])
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'USER_HAS_TOO_MANY_TASKS'"
        );
      }
    });

    it(`Should reject allocating task to user ${users[0]} when she is not working`, async function () {
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      calendar.push([nowInS + 3600, nowInS + 3600 * 2]); // Range 1h to 2h from now
      calendar.push([nowInS + 3600 * 2, nowInS + 3600 * 3]);
      calendar.push([nowInS + 3600 * 4, nowInS + 3600 * 6]);
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendar
      );

      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinCalTAAInstance.allocateTask(
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(users[0])
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TASK_ALLOCATION_FAIL'"
        );
      }
    });
  });

  describe("Accept task", function () {
    it(`Should assign task ${tasks[0].job_id} to user ${users[0]} and emit a task accepted event`, async function () {
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      calendar.push([nowInS, nowInS + 3600 * 2]); // Range now to 1h
      calendar.push([nowInS + 3600 * 2, nowInS + 3600 * 3]);
      calendar.push([nowInS + 3600 * 4, nowInS + 3600 * 6]);
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendar
      );
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );
      await roundRobinCalTAAInstance.allocateTask(
        formatBytes32String(tasks[0].job_id),
        formatBytes32String(users[0])
      );

      await expect(
        roundRobinCalTAAInstance.acceptTask(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        )
      )
        .to.emit(roundRobinCalTAAInstance, "TaskAccepted")
        .withArgs(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        );
    });

    it(`Should reject assigning a task ${tasks[0].job_id} to an unregistered user ${users[0]}`, async function () {
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinCalTAAInstance.acceptTask(
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
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinCalTAAInstance.acceptTask(
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
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      calendar.push([nowInS, nowInS + 3600 * 2]); // Range now to 1h
      calendar.push([nowInS + 3600 * 2, nowInS + 3600 * 3]);
      calendar.push([nowInS + 3600 * 4, nowInS + 3600 * 6]);
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendar
      );
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );
      await roundRobinCalTAAInstance.allocateTask(
        formatBytes32String(tasks[0].job_id),
        formatBytes32String(users[0])
      );

      await expect(
        roundRobinCalTAAInstance.rejectTask(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        )
      )
        .to.emit(roundRobinCalTAAInstance, "TaskRejected")
        .withArgs(
          formatBytes32String(users[0]),
          formatBytes32String(tasks[0].job_id)
        );
    });

    it(`Should reject rejecting a task ${tasks[0].job_id} to an unregistered user ${users[0]}`, async function () {
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinCalTAAInstance.rejectTask(
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
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      try {
        await roundRobinCalTAAInstance.rejectTask(
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
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let calendar = [];
      let nowInS = +(Date.now() / 1000).toFixed(0);
      calendar.push([nowInS, nowInS + 3600 * 2]); // Range now to 1h
      calendar.push([nowInS + 3600 * 2, nowInS + 3600 * 3]);
      calendar.push([nowInS + 3600 * 4, nowInS + 3600 * 6]);
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendar
      );
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[1])
      );
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[1]),
        calendar
      );

      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );
      await roundRobinCalTAAInstance.allocateTask(
        formatBytes32String(tasks[0].job_id),
        formatBytes32String(users[0])
      );

      let timestamp = Date.now();
      let currentTimestamp = Date.now();
      while (currentTimestamp < timestamp + REALLOCATION_TIME) {
        currentTimestamp = Date.now();
      }

      await expect(
        roundRobinCalTAAInstance.reallocateTask(
          formatBytes32String(tasks[0].job_id)
        )
      )
        .to.emit(roundRobinCalTAAInstance, "TaskAllocated")
        .withArgs(
          formatBytes32String(users[1]),
          formatBytes32String(tasks[0].job_id),
          formatBytes32String(users[0])
        );
    });

    it(`Should reject reallocating a non existing task ${tasks[0].job_id}`, async function () {
      try {
        await roundRobinCalTAAInstance.reallocateTask(
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
