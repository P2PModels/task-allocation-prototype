pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";

import "../BaseTaskAllocation.sol";

contract RoundRobinApp is AragonApp, BaseTaskAllocation {
    using SafeMath for uint256;

    /// Events
    event TaskAccepted(bytes32 indexed userId, bytes32 indexed taskId);
    event TaskRejected(bytes32 indexed userId, bytes32 indexed taskId);
    event TaskAllocated(bytes32 indexed userId, bytes32 indexed taskId, bytes32 previousUserId);
    event UserRegistered(bytes32 indexed userId);

    ///Types
    enum Status {
        NonExistent,
        Available,
        Assigned,
        Accepted,
        Rejected,
        Completed
    }

    mapping(bytes32 => Task) tasks;

    mapping(bytes32 => User) users;
    //Need it to transvers users array more gracefuly. 
    mapping(uint256 => bytes32) private userIndex;
    uint256 private userIndexLength;

    //To keep record of user's assignments. Users only can have 1 task assigned.
    /*
     * Key: userId
     */
    mapping(bytes32 => bool) userTaskRegistry;

    uint256 public reallocationTime;

    struct User {
        uint256 index;
        uint256 benefits;
        bool available;
        bool exists;
    }

    struct Task {
        uint256 reallocationThreshold;
        uint256 userIndex;
        Status status;
        // bytes32 languageGroup;
        mapping(bytes32 => bool) rejecters;
    }



    ///Errors
    string private constant ERROR_ASSIGNED_TASK = "TASK_ALREADY_ASSIGNED";
    string private constant ERROR_USER_HAS_TASK = "USER_HAS_TASK";
    string private constant ERROR_USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
    string private constant ERROR_USER_DONT_EXIST = "USER_DONT_EXIST";
    string private constant ERROR_TASK_EXISTS = "TASK_EXISTS";
    string private constant ERROR_TASK_DONT_EXIST = "TASK_DONT_EXIST";
    string private constant ERROR_TASK_NOT_ASSIGNED_TO_USER = "TASK_NOT_ASSIGNED_TO_USER";

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
        require(tasks[_taskId].status != Status.NonExistent, ERROR_TASK_DONT_EXIST);
        _;
    }

    modifier taskAssigned(bytes32 _taskId, bytes32 _userId) {
        Task memory task = tasks[_taskId];
        bytes32 userId = userIndex[task.userIndex];
        require(task.status == Status.Assigned && _userId == userId, ERROR_TASK_NOT_ASSIGNED_TO_USER);
        _;
    }

    function initialize() public onlyInit {
        initialized();
        reallocationTime = 1800;
        // reallocationTime = 90;
    }

    function restart() external {
        emit TasksRestart(msg.sender);
    }

    function registerUser(bytes32 _userId)
    external
    userDontExist(_userId)
    {
        userIndex[userIndexLength] = _userId;
        users[_userId].index = userIndexLength;
        users[_userId].available = true;
        users[_userId].exists = true;
        userIndexLength = userIndexLength.add(1);

        emit UserRegistered(_userId);
    }

    function acceptTask(
        bytes32 _userId,
        bytes32 _taskId
    )
    external
    userExists(_userId)
    taskAssigned(_taskId, _userId)
    userHasNoTask(_userId)
    {
        tasks[_taskId].status = Status.Accepted;
        userTaskRegistry[_userId] = true;
        emit TaskAccepted(_userId, _taskId);
    }

    function rejectTask(
        bytes32 _userId,
        bytes32 _taskId
    )
    external
    userExists(_userId)
    taskAssigned(_taskId, _userId)
    {
        tasks[_taskId].rejecters[_userId] = true;
        emit TaskRejected(_userId, _taskId);
        reallocateTask(_taskId);
    }
    /**
     * @notice Create and allocate a new assignment. We will receive the initial random assignee
     * @param _userId The user's id.
     * @param _taskId The task's id.
     */
    function createTask(
        // bytes32 _languageGroup,
        bytes32 _userId,
        bytes32 _taskId
    )
    external
    taskDontExist(_taskId)
    userHasNoTask(_userId)
    {
        uint256 uIndex = users[_userId].index;
        //Use fancy struct instantiation to omit mapping declaration.
        tasks[_taskId] = Task({
            reallocationThreshold: block.timestamp.add(reallocationTime),
            status: Status.Assigned,
            userIndex: uIndex
        });
        emit TaskAllocated(_userId, _taskId, "");
    }

    function reallocateTask(
        bytes32 _taskId
    )
    public
    taskExists(_taskId)
    {
        Task storage task = tasks[_taskId];
        uint oldUserIndex = task.userIndex;
        uint newUserIndex = oldUserIndex.add(1);
        bool assigneeFounded = false;
        uint userCounter = 0;

        while (userCounter < userIndexLength && !assigneeFounded) {
            if (newUserIndex == userIndexLength) {
                newUserIndex = 0;
            }
            bytes32 currUserId = userIndex[newUserIndex];
            User memory currUser = users[currUserId];
            // User doesn't have a task already and didn't reject current task.
            if (currUser.available && !userTaskRegistry[currUserId] && !task.rejecters[currUserId]) {
                assigneeFounded = true;
                task.userIndex = newUserIndex;
                task.status = Status.Assigned;
                task.reallocationThreshold = block.timestamp.add(reallocationTime);
                emit TaskAllocated(userIndex[newUserIndex], _taskId, userIndex[oldUserIndex]);
            } else {
                userCounter = userCounter.add(1);
                newUserIndex = newUserIndex.add(1);
            }
        }
        if (!assigneeFounded) {
            task.status = Status.Rejected;
        }
    }

    function getUser(
        bytes32 _userId
    )
    external
    view
    returns(bool)
    {
        return users[_userId].exists;
    }

    function getUserIndex(
        bytes32 _userId
    )
    external
    view
    returns(uint256)
    {
        return users[_userId].index;
    }

    function getUserByIndex(
        uint256 _index
    )
    external
    view
    returns(bytes32)
    {
        return userIndex[_index];
    }

    function getUsersCount()
    external
    view
    returns (uint256) {
        return userIndexLength;
    }

    function getTaskUserIndex(bytes32 _taskId)
    external
    view
    taskExists(_taskId)
    returns (
        uint256 userIndex
    ) 
    {
        Task memory task = tasks[_taskId];
        userIndex = task.userIndex;
    }

    function getTask(bytes32 _taskId)
    external
    view
    taskExists(_taskId)
    returns (
        uint256 endDate
    ) 
    {
        Task memory task = tasks[_taskId];
        endDate = task.reallocationThreshold;
    }
}
