pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../BaseTaskAllocation.sol";

// Round Robin Task Allocation App
contract RoundRobinCalTAA is BaseTaskAllocation {
    using SafeMath for uint256;

    /// Events
    event TaskCreated(bytes32 indexed taskId);
    event TaskDeleted(bytes32 indexed taskId);
    event TaskAccepted(bytes32 indexed userId, bytes32 indexed taskId);
    event TaskRejected(bytes32 indexed userId, bytes32 indexed taskId);
    event TaskAllocated(
        bytes32 indexed userId,
        bytes32 indexed taskId,
        bytes32 previousUserId
    );
    event UserRegistered(bytes32 indexed userId);
    event UserCalendarUpdated(bytes32 indexed userId);
    event UserDeleted(bytes32 indexed userId);
    event RejecterDeleted(bytes32 indexed userId, bytes32 indexed taskId);

    /// Task statuses
    enum Status {
        NonExistent,
        Available,
        Assigned,
        Accepted,
        Rejected,
        Completed
    }

    mapping(bytes32 => Task) tasks;

    // List of task ids used for restarting purposes
    bytes32[] taskIds;

    mapping(bytes32 => User) users;

    //Need it to transvers users array more gracefuly.
    mapping(uint256 => bytes32) private userIndex;
    uint256 private userIndexLength;

    //To keep record of user's assignments and control that users can only
    // have 1 task accepted
    /*
     * Key: userId
     */
    mapping(bytes32 => bool) userTaskRegistry;

    struct User {
        uint256 index;
        uint256 benefits; // <-- to be used in the future to award users for tasks completed
        bool available;
        uint256[2][] calendarRanges; // Always ordered in increasing time for performance. Determines wheter the user is working or not
        // Check if the user exists in the mapping
        bool exists;
        // List of tasks assigned to the userof array
        mapping(uint256 => bytes32) allocatedTasks;
        uint256 allocatedTasksLength;
    }

    struct Task {
        uint256 userIndex;
        // Need this to remove task when being reallocated
        uint256 allocationIndex;
        // Indicate when the task should be reasigned
        uint256 endDate;
        // Take one of the statuses value
        Status status;
        // List of users who rejected the task
        mapping(bytes32 => bool) rejecters;
        // Indicate how often, in seconds, the task will be reasigned
        uint256 reallocationTime;
        // bytes32 languageGroup. // <-- to be used in the future
    }

    // Indicate the maximum number of tasks that can assigned to users
    uint8 public constant MAX_ALLOCATED_TASKS = 3;

    ///Errors
    string private constant ERROR_ASSIGNED_TASK = "TASK_ALREADY_ASSIGNED";
    string private constant ERROR_USER_HAS_TASK = "USER_HAS_TASK";
    string private constant ERROR_USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
    string private constant ERROR_USER_DONT_EXIST = "USER_DONT_EXIST";
    string private constant ERROR_TASK_EXISTS = "TASK_EXISTS";
    string private constant ERROR_TASK_DONT_EXIST = "TASK_DONT_EXIST";
    string private constant ERROR_TASK_ALLOCATION = "TASK_ALLOCATION_FAIL";
    string private constant ERROR_TASK_NOT_ASSIGNED_TO_USER =
        "TASK_NOT_ASSIGNED_TO_USER";
    string private constant ERROR_USER_HAS_TOO_MANY_TASKS =
        "USER_HAS_TOO_MANY_TASKS";
    string private constant ERROR_PAST_TIME_RANGE = "PAST_TIME_RANGE";

    string private constant ERROR_INVALID_TIME_RANGE = "INVALID_TIME_RANGE";
    string private constant ERROR_TIME_RANGES_NOT_ORDERED =
        "TIME_RANGES_NOT_INCREASINGLY_ORDERED";

    // Verification functions
    modifier userHasNoTask(bytes32 _userId) {
        require(!userTaskRegistry[_userId], ERROR_USER_HAS_TASK);
        _;
    }

    modifier userDontExist(bytes32 _userId) {
        require(!users[_userId].exists, ERROR_USER_ALREADY_EXISTS);
        _;
    }

    modifier userExists(bytes32 _userId) {
        require(users[_userId].exists, ERROR_USER_DONT_EXIST);
        _;
    }

    modifier taskDontExist(bytes32 _taskId) {
        require(tasks[_taskId].status == Status.NonExistent, ERROR_TASK_EXISTS);
        _;
    }

    modifier taskExists(bytes32 _taskId) {
        require(
            tasks[_taskId].status != Status.NonExistent,
            ERROR_TASK_DONT_EXIST
        );
        _;
    }

    // Check if the task was previously assigned to user
    modifier taskAssigned(bytes32 _taskId, bytes32 _userId) {
        Task storage task = tasks[_taskId];
        bytes32 userId = userIndex[task.userIndex];
        require(
            task.status == Status.Assigned && _userId == userId,
            ERROR_TASK_NOT_ASSIGNED_TO_USER
        );
        _;
    }

    modifier tooManyTasks(bytes32 _userId) {
        require(
            users[_userId].allocatedTasksLength <= MAX_ALLOCATED_TASKS,
            ERROR_USER_HAS_TOO_MANY_TASKS
        );
        _;
    }

    // Contract "constructor"
    // function initialize() public onlyInit {
    //     initialized();
    // }

    // Function used to clean up the contract
    function restart() external override {
        // Remove tasks
        for (uint256 i = 0; i < taskIds.length; i++) {
            bytes32 tId = taskIds[i];
            Task storage task = tasks[tId];

            // Delete rejecters of the task. Need to empty mapping manually.
            for (uint256 j = 0; j < userIndexLength; j++) {
                bytes32 rId = userIndex[j];
                task.rejecters[rId] = false;
                emit RejecterDeleted(rId, tId);
            }

            // Set the status of the task to non-existent
            task.status = Status.NonExistent;

            // Emit an event indicating that task has been deleted
            emit TaskDeleted(tId);
        }

        // Remove users
        for (uint256 k = 0; k < userIndexLength; k++) {
            bytes32 uId = userIndex[k];
            User storage user = users[uId];
            user.exists = false;
            // Need to empty mapping manually.
            user.allocatedTasksLength = 0;
            delete user.calendarRanges; // Empty availability
            userTaskRegistry[uId] = false;

            emit UserDeleted(uId);
        }

        delete taskIds;

        userIndexLength = 0;

        emit TasksRestart(msg.sender);
    }

    // Function used to register users
    function registerUser(bytes32 _userId) external userDontExist(_userId) {
        userIndex[userIndexLength] = _userId;
        users[_userId].index = userIndexLength;
        users[_userId].available = true;
        users[_userId].exists = true;
        users[_userId].benefits = 0;
        users[_userId].allocatedTasksLength = 0;

        userIndexLength = userIndexLength.add(1);

        emit UserRegistered(_userId);
    }

    /**
     * @notice Updates users calendar.
     * @param _userId The user's id.
     * @param ranges The time ranges in wich the user is working .
     */
    function setUserCalendarRanges(bytes32 _userId, uint256[2][] memory ranges)
        external
        userExists(_userId)
    {
        uint256 i = 0;
        for (i = 0; i < ranges.length; i++) {
            // Check that the array is ordered and with valid values
            require(
                ranges[i][0] > (block.timestamp - 3600 * 24),
                ERROR_PAST_TIME_RANGE
            ); // Allow ranges starting the day before
            require(ranges[i][0] < ranges[i][1], ERROR_INVALID_TIME_RANGE);
            if (i + 1 < ranges.length) {
                require(
                    ranges[i][0] < ranges[i + 1][0],
                    ERROR_TIME_RANGES_NOT_ORDERED
                );
            }

            //Assign
            users[_userId].calendarRanges.push([ranges[i][0], ranges[i][1]]);
        }

        emit UserCalendarUpdated(_userId);
    }

    /**
     * @notice Create a new task.
     * @param _taskId The task's id.
     */
    function createTask(
        // bytes32 _languageGroup,
        bytes32 _taskId,
        uint256 reallocationTime
    ) external taskDontExist(_taskId) {
        Task storage task = tasks[_taskId];
        task.status = Status.Available;
        task.userIndex = 0;
        task.allocationIndex = 0;
        task.endDate = 0;
        task.reallocationTime = reallocationTime;

        taskIds.push(_taskId);
        emit TaskCreated(_taskId);
    }

    // Call the function that assigns a task to a user
    function allocateTask(bytes32 _taskId, bytes32 _userId)
        external
        taskExists(_taskId)
        userExists(_userId)
    {
        bool allocated = addUserAllocatedTask(_userId, _taskId);
        require(allocated, ERROR_TASK_ALLOCATION);
        emit TaskAllocated(_userId, _taskId, 0);
    }

    // Function called when a user accepts a task
    function acceptTask(bytes32 _userId, bytes32 _taskId)
        external
        userExists(_userId)
        taskAssigned(_taskId, _userId)
        userHasNoTask(_userId)
    {
        tasks[_taskId].status = Status.Accepted;
        userTaskRegistry[_userId] = true;
        //Can't access mapping inside user struct
        //unless It's declare using storage keyword.
        User storage user = users[_userId];
        bytes32 currentTaskId;
        // When a user accepts a task and since users are restricted to have
        // only one task accepted the rest of task asigned to the user are
        // reallocated
        for (uint256 i = 0; i < user.allocatedTasksLength; i++) {
            currentTaskId = user.allocatedTasks[i];
            if (currentTaskId != _taskId) {
                reallocateTask(currentTaskId);
            }
        }
        emit TaskAccepted(_userId, _taskId);
    }

    // Function used when a user rejects a task
    function rejectTask(bytes32 _userId, bytes32 _taskId)
        external
        userExists(_userId)
        taskAssigned(_taskId, _userId)
    {
        tasks[_taskId].rejecters[_userId] = true;
        emit TaskRejected(_userId, _taskId);
    }

    // Fucntion that implements the round-robin
    // algorithm
    function reallocateTask(bytes32 _taskId) public taskExists(_taskId) {
        Task storage task = tasks[_taskId];
        uint256 oldUserIndex = task.userIndex;
        bytes32 oldUserId = userIndex[oldUserIndex];
        uint256 newUserIndex = oldUserIndex.add(1);
        bool assigneeFounded = false;
        uint256 userCounter = 0;

        // Delete task from the previous "owner"
        deleteUserAllocatedTask(oldUserId, _taskId);

        // Iterate until find a user to whom assign the task or
        // the array of users was totally traversed
        while (userCounter < userIndexLength && !assigneeFounded) {
            // Check if index arrives to the end of the round
            // then it should start over
            if (newUserIndex == userIndexLength) {
                newUserIndex = 0;
            }
            bytes32 currUserId = userIndex[newUserIndex];
            // Try to assigned that task to user (currUserId)
            assigneeFounded = addUserAllocatedTask(currUserId, _taskId);
            // If assignation was successful emit event TaskAllocated
            if (assigneeFounded) {
                emit TaskAllocated(userIndex[newUserIndex], _taskId, oldUserId);
            } else {
                // If assignation did not work out increase counters to
                // continue with the round robin
                userCounter = userCounter.add(1);
                newUserIndex = newUserIndex.add(1);
            }
        }
        // Assign rejected status to the task if it couldn't be assigned to
        // a user
        if (!assigneeFounded) {
            task.status = Status.Rejected;
        }
    }

    // Function used to assign a task to a user
    function addUserAllocatedTask(bytes32 _userId, bytes32 _taskId)
        private
        returns (bool)
    {
        User storage user = users[_userId];
        Task storage task = tasks[_taskId];

        // User doesn't have a task already and didn't reject current task.
        // User is currently working
        if (
            user.available &&
            !userTaskRegistry[_userId] &&
            !task.rejecters[_userId] &&
            user.allocatedTasksLength <= MAX_ALLOCATED_TASKS &&
            user.calendarRanges[0][0] <= block.timestamp &&
            user.calendarRanges[0][1] >= block.timestamp
        ) {
            user.allocatedTasks[user.allocatedTasksLength] = _taskId;
            task.allocationIndex = user.allocatedTasksLength;
            user.allocatedTasksLength = user.allocatedTasksLength.add(1);

            task.userIndex = user.index;
            task.status = Status.Assigned;
            task.endDate = block.timestamp.add(task.reallocationTime);

            return true;
        }
        return false;
    }

    function deleteUserAllocatedTask(bytes32 _userId, bytes32 _taskId) private {
        User storage user = users[_userId];
        uint256 lastTaskIndex;
        bytes32 lastTask;
        uint256 allocatedTaskIndex = tasks[_taskId].allocationIndex;
        if (user.allocatedTasksLength > 0) {
            lastTaskIndex = user.allocatedTasksLength.sub(1);
        } else {
            lastTaskIndex = user.allocatedTasksLength;
        }
        lastTask = user.allocatedTasks[lastTaskIndex];
        user.allocatedTasksLength = lastTaskIndex;
        user.allocatedTasks[allocatedTaskIndex] = lastTask;
    }

    // Getters

    function getUser(bytes32 _userId)
        external
        view
        returns (
            uint256 index,
            uint256 benefits,
            bool available,
            bool exists,
            uint256 allocatedTasksLength,
            uint256[2][] memory calendarRanges
        )
    {
        User storage user = users[_userId];
        index = user.index;
        benefits = user.benefits;
        available = user.available;
        exists = user.exists;
        allocatedTasksLength = user.allocatedTasksLength;
        calendarRanges = user.calendarRanges;
    }

    function getAllocatedTask(bytes32 _userId, uint256 _taskIndex)
        external
        view
        returns (bytes32)
    {
        return users[_userId].allocatedTasks[_taskIndex];
    }

    function getTask(bytes32 _taskId)
        external
        view
        returns (
            bytes32 assignee,
            uint256 allocationIndex,
            uint256 endDate,
            Status status,
            uint256 reallocationTime
        )
    {
        Task storage task = tasks[_taskId];

        assignee = userIndex[task.userIndex];
        allocationIndex = task.allocationIndex;
        endDate = task.endDate;
        status = task.status;
        reallocationTime = task.reallocationTime;
    }

    function getRejecter(bytes32 _taskId, bytes32 _userId)
        external
        view
        returns (bool)
    {
        return tasks[_taskId].rejecters[_userId];
    }

    function getUserLength() external view returns (uint256) {
        return userIndexLength;
    }
}
