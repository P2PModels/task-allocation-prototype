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
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4]; // Begining of time ranges
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ]; // Ending of time ranges
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      await expect(
        roundRobinCalTAAInstance.setUserCalendarRanges(
          formatBytes32String(users[0]),
          calendarRangesStart,
          calendarRangesEnd
        )
      )
        .to.emit(roundRobinCalTAAInstance, "UserCalendarUpdated")
        .withArgs(formatBytes32String(users[0]));
    });

    it(`Should reject start and end time ranges arrays that doesnt have same number of elements`, async function () {
      // Mock availability calendar, smart contract stores timestamo in s
      let nowInS = +(Date.now() / 1000).toFixed(0);
      // Wrong time ranges, all from the past
      let calendarRangesStart = [nowInS - 3600 * 48, nowInS - 3600 * 3];
      let calendarRangesEnd = [nowInS, nowInS - 3600 * 2, nowInS - 3600 * 4];

      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      try {
        await roundRobinCalTAAInstance.setUserCalendarRanges(
          formatBytes32String(users[0]),
          calendarRangesStart,
          calendarRangesEnd
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'INVALID_TIME_RANGES'"
        );
      }
    });

    // Maximum time in the past 24h
    it(`Should reject adding past time ranges to user ${users[0]} calendar`, async function () {
      // Mock availability calendar, smart contract stores timestamo in s
      let nowInS = +(Date.now() / 1000).toFixed(0);
      // Wrong time ranges, all from the past
      let calendarRangesStart = [
        nowInS - 3600 * 48,
        nowInS - 3600 * 3,
        nowInS - 3600 * 6,
      ];
      let calendarRangesEnd = [nowInS, nowInS - 3600 * 2, nowInS - 3600 * 4];

      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      try {
        await roundRobinCalTAAInstance.setUserCalendarRanges(
          formatBytes32String(users[0]),
          calendarRangesStart,
          calendarRangesEnd
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'PAST_TIME_RANGE'"
        );
      }
    });

    it(`Should reject adding invalid time ranges to user ${users[0]} calendar`, async function () {
      // Mock availability calendar, smart contract stores timestamo in s
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];

      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      try {
        // Incorrectly sent values, end values as start
        await roundRobinCalTAAInstance.setUserCalendarRanges(
          formatBytes32String(users[0]),
          calendarRangesEnd,
          calendarRangesStart
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'INVALID_TIME_RANGE'"
        );
      }
    });

    it(`Should reject adding, to user ${users[0]} calendar, not increasingly ordered time ranges`, async function () {
      // Mock availability calendar, smart contract stores timestamo in s
      let nowInS = +(Date.now() / 1000).toFixed(0);
      // Wrong time ranges, not properly ordered
      let calendarRangesStart = [nowInS + 3600 * 2, nowInS, nowInS + 3600 * 4]; // Begining of time ranges
      let calendarRangesEnd = [
        nowInS + 3600 * 3,
        nowInS + 3600 * 2,
        nowInS + 3600 * 6,
      ]; // Ending of time ranges

      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      try {
        await roundRobinCalTAAInstance.setUserCalendarRanges(
          formatBytes32String(users[0]),
          calendarRangesStart,
          calendarRangesEnd
        );
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'TIME_RANGES_NOT_INCREASINGLY_ORDERED'"
        );
      }
    });

    it(`Should get user ${users[0]}, including calendar time ranges`, async function () {
      // Mock availability calendar, smart contract stores timestamo in s
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];

      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );

      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendarRangesStart,
        calendarRangesEnd
      );

      let userArray = await roundRobinCalTAAInstance.getUser(
        formatBytes32String(users[0])
      );

      // Only checking first value of calendar, all object could be logged
      await expect(userArray["calendarRangesStart"][0].toNumber()).to.equal(
        calendarRangesStart[0]
      );
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
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendarRangesStart,
        calendarRangesEnd
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
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendarRangesStart,
        calendarRangesEnd
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

    it(`Should reject allocating task to user ${users[0]} when she is not working`, async function () {
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendarRangesStart,
        calendarRangesEnd
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
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendarRangesStart,
        calendarRangesEnd
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
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendarRangesStart,
        calendarRangesEnd
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
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];

      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendarRangesStart,
        calendarRangesEnd
      );
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[1])
      );
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[1]),
        calendarRangesStart,
        calendarRangesEnd
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

    it(`Should set task status to rejected since only the only available user ${users[0]} already have max number of task assigned`, async function () {
      let maxNumOfTasks =
        await roundRobinCalTAAInstance.MAX_ALLOCATED_TASKS.call();
      // Due to index initialization only one user should never be registered when trying to test reallocation
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[1])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];
      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[1]),
        calendarRangesStart,
        calendarRangesEnd
      );

      for (let i = 0; i <= maxNumOfTasks; i++) {
        await roundRobinCalTAAInstance.createTask(
          formatBytes32String(tasks[i].job_id),
          REALLOCATION_TIME
        );
        await roundRobinCalTAAInstance.reallocateTask(
          formatBytes32String(tasks[i].job_id)
        );
      }

      let reallocatedTask = await roundRobinCalTAAInstance.getTask(
        formatBytes32String(tasks[maxNumOfTasks].job_id)
      );

      expect(reallocatedTask.status).to.equal(4); //Rejected value in enum
    });

    it(`Should set task ${tasks[0].job_id} status to rejected since no user is available`, async function () {
      // Register user1
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[0])
      );
      // Mock availability calendar, smart contract stores timestamo in s
      let nowInS = +(Date.now() / 1000).toFixed(0);
      let calendarRangesStart = [nowInS, nowInS + 3600 * 2, nowInS + 3600 * 4];
      let calendarRangesEnd = [
        nowInS + 3600 * 2,
        nowInS + 3600 * 3,
        nowInS + 3600 * 6,
      ];

      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[0]),
        calendarRangesStart,
        calendarRangesEnd
      );

      // Register user2
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[1])
      );

      // Remove first range so that the user its not available now
      calendarRangesStart = [nowInS + 3600 * 2, nowInS + 3600 * 4];
      calendarRangesEnd = [nowInS + 3600 * 3, nowInS + 3600 * 6];

      await roundRobinCalTAAInstance.setUserCalendarRanges(
        formatBytes32String(users[1]),
        calendarRangesStart,
        calendarRangesEnd
      );

      // Register user3 without availability calendar
      await roundRobinCalTAAInstance.registerUser(
        formatBytes32String(users[2])
      );

      // Create task
      await roundRobinCalTAAInstance.createTask(
        formatBytes32String(tasks[0].job_id),
        REALLOCATION_TIME
      );

      // Allocate it
      await roundRobinCalTAAInstance.reallocateTask(
        formatBytes32String(tasks[0].job_id)
      );

      // User1 rejects it
      await roundRobinCalTAAInstance.rejectTask(
        formatBytes32String(users[0]),
        formatBytes32String(tasks[0].job_id)
      );

      // Reallocate
      await roundRobinCalTAAInstance.reallocateTask(
        formatBytes32String(tasks[0].job_id)
      );

      let task = await roundRobinCalTAAInstance.getTask(
        formatBytes32String(tasks[0].job_id)
      );

      expect(task["status"]).to.equal(4); // Rejected - 4
    });
  });
});
