pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../BaseTaskAllocation.sol";

// Round Robin Task Allocation App
contract FCFSTAA is BaseTaskAllocation {

    using SafeMath for uint256;

    /// Events
    event TaskCreated(bytes32 indexed taskId);
    event TaskDeleted(bytes32 indexed taskId);
    event TaskAccepted(bytes32 indexed userId, bytes32 indexed taskId);
    event UserRegistered(bytes32 indexed userId);
    event UserDeleted(bytes32 indexed userId);

    /// Task statuses
    enum Status {
        NonExistent,
        Available,
        Accepted,
        Completed
    }

    mapping(bytes32 => Task) tasks;

    // List of task ids used for restarting purposes
    bytes32[] taskIds;

    mapping(bytes32 => User) users;

    //Need it to transvers users array more gracefuly. 
    mapping(uint256 => bytes32) private userIndexToId;
    uint256 private numberOfUsers;

    //To keep record of user's assignments and control that users can only 
    // have 1 task accepted
    /*
     * Key: userId
     */
    mapping(bytes32 => bool) userTaskRegistry;

    struct User {
        uint256 index;
        bool exists; // Check if the user exists in the mapping
    }

    struct Task {
        uint256 userIndex;
        uint256 endDate; // When the task should be removed
        Status status; // Take one of the statuses value
    }

    uint32 constant public TIME_TO_ACCEPT_TASK = 259200; // 3 days 

    ///Errors
    string private constant ERROR_USER_HAS_TASK = "USER_HAS_TASK";
    string private constant ERROR_USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
    string private constant ERROR_USER_DONT_EXIST = "USER_DONT_EXIST";
    string private constant ERROR_TASK_EXISTS = "TASK_EXISTS";
    string private constant ERROR_TASK_DONT_EXIST = "TASK_DONT_EXIST";
    string private constant ERROR_TASK_ALLOCATION = "TASK_ALLOCATION_FAIL";
    string private constant ERROR_TASK_NOT_AVAILABLE = "TASK_NOT_AVAILABLE";

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
        require(tasks[_taskId].status != Status.NonExistent, ERROR_TASK_DONT_EXIST);
        _;
    }
    modifier taskAvailable(bytes32 _taskId) {
        Task storage task = tasks[_taskId];
        require(task.status == Status.Available, ERROR_TASK_NOT_AVAILABLE);
        _;
    }

    // Function used to register users
    function registerUser(bytes32 _userId)
    external
    userDontExist(_userId)
    {
        userIndexToId[numberOfUsers] = _userId;
        users[_userId].index = numberOfUsers;
        users[_userId].exists = true;

        numberOfUsers = numberOfUsers.add(1);

        emit UserRegistered(_userId);
    }

    /**
     * @notice Create a new task.
     * @param _taskId The task's id.
     */
    function createTask(
        bytes32 _taskId
    )
    external
    taskDontExist(_taskId)
    {
        Task storage task = tasks[_taskId];
        task.userIndex = 0;
        task.endDate = block.timestamp.add(TIME_TO_ACCEPT_TASK);
        task.status = Status.Available;

        taskIds.push(_taskId);
        emit TaskCreated(_taskId);
    }

    // TODO 
    // Fucntion that removes the task once the endDate time has expired
    // function removeTask(
    //     bytes32 _taskId
    // )
    // public
    // taskExists(_taskId)
    // {
        
    // }

    // Function called when a user accepts a task
    function acceptTask(
        bytes32 _userId,
        bytes32 _taskId
    )
    external
    userExists(_userId)
    taskExists(_taskId)
    taskAvailable(_taskId)
    userHasNoTask(_userId)
    {
        userTaskRegistry[_userId] = true;

        tasks[_taskId].status = Status.Accepted;
        tasks[_taskId].userIndex = users[_userId].index;
        
        emit TaskAccepted(_userId, _taskId);
    }


     // Function used to clean up the contract
    function restart() override external {
         // Remove tasks
        for (uint i = 0; i < taskIds.length; i++) {
            bytes32 tId = taskIds[i];
            Task storage task = tasks[tId];

            // Set the status of the task to non-existent
            task.status = Status.NonExistent;

            // Emit an event indicating that task has been deleted
            emit TaskDeleted(tId);
        }

        // Remove users
        for (uint k = 0; k < numberOfUsers; k++) {
            bytes32 uId = userIndexToId[k];
            User storage user = users[uId];
            user.exists = false;

            userTaskRegistry[uId] = false;

            emit UserDeleted(uId);
        }

        delete taskIds;

        numberOfUsers = 0;

        emit TasksRestart(msg.sender);
    }

}
