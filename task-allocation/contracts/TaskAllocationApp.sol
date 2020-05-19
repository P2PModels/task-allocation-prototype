pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";


contract TaskAllocationApp is AragonApp {
    using SafeMath for uint256;

    /// Events
    event TaskAssigned(bytes32 languageGroup, string userId, string taskId);
    event TasksRestart(address indexed entity);
    event ApiUrlSet(string apiUrl);
    ///Types
    enum Status {New, Assigned, Completed}

    struct Task {
        Status status;
    }

    /// State
    string public apiUrl;

    mapping(string => Task) tasks;

    bytes32[] languageGroups;
    string[] users;
    string[] tasksIds;
    /**
     * Key: Language group (en-es).
     * Value:
        Key: User id
        Value: Task id
     */
    mapping(bytes32 => mapping(string => string)) taskRegistry;

    // mapping(bytes32 => Task) public tasks;
    // mapping(address => mapping(bytes32 => bool)) private languageGroupUser;
    // mapping(address => AssignedTasks) assignedTasksRegistry;

    //If we need to transverse tasks we can use this:
    // mapping(uint256 => bytes32) private taskIndex;
    // uint256 private taskIndexLength;

    /// ACL
    bytes32 constant public ASSIGN_TASK_ROLE = keccak256("ASSIGN_TASK_ROLE");

    string private constant ERROR_ASSIGNED_TASK = "TASK_ALREADY_ASSIGNED";
    string private constant ERROR_USER_HAS_TASK = "USER_HAS_TASK";

    function initialize() public onlyInit {
        initialized();
    }

    modifier taskAlreadyAssigned(bytes32 _languageGroup, string _userId, string _taskId) {
        require(tasks[_taskId].status != Status.Assigned, ERROR_ASSIGNED_TASK);
        _;
    }

    modifier userAlreadyHasTask(bytes32 _languageGroup, string _userId) {
        bytes memory str = bytes(taskRegistry[_languageGroup][_userId]);
        require(str.length == 0, ERROR_USER_HAS_TASK);
        _;
    }

    /**
     * @notice Assign a new task.
     * @param _taskId The task's id.
     * @param _languageGroup User's translation group
     * @param _userId The user's id.
     */

    function assignTask(
        bytes32 _languageGroup,
        string _userId,
        string _taskId
    )
    external
    taskAlreadyAssigned(_languageGroup, _userId, _taskId)
    userAlreadyHasTask(_languageGroup, _userId)
    auth(ASSIGN_TASK_ROLE)
    {
        if (!userExists(_userId)) {
            users.push(_userId);
        }
        if (!languageGroupExists(_languageGroup)) {
            languageGroups.push(_languageGroup);
        }
        tasksIds.push(_taskId);

        taskRegistry[_languageGroup][_userId] = _taskId;
        tasks[_taskId].status = Status.Assigned;
        emit TaskAssigned(_languageGroup, _userId, _taskId);
    }

    function getUserTask(bytes32 _languageGroup, string _userId) external view returns(string) {
        return taskRegistry[_languageGroup][_userId];
    }

    function restart() external {
        for(uint k = 0; k < tasksIds.length; k++) {
            string memory id = tasksIds[k];
            tasks[id].status = Status.New;
        }
        for (uint i = 0; i < languageGroups.length; i++) {
            bytes32 lg = languageGroups[i];
            for (uint j = 0; j < users.length; j++) {
                string memory u = users[j];
                taskRegistry[lg][u] = "";
            }
        }
        delete tasksIds;
        delete languageGroups;
        delete users;

        emit TasksRestart(msg.sender);
    }

    function setApiUrl(string _apiUrl) external {
        apiUrl = _apiUrl;
        emit ApiUrlSet(_apiUrl);
    }

    function userExists(string _userId) private view returns(bool) {
        uint i = 0;
        while(i < users.length) {
            if(keccak256(bytes(users[i])) == keccak256(bytes(_userId)))
                return true;
            i++;
        }
        return false;
    }

    function languageGroupExists(bytes32 _languageGroup) private view returns(bool) {
        uint i = 0;
        while(i < languageGroups.length) {
            if (languageGroups[i] == _languageGroup) {
                return true;
            }
            i++;
        }
        return false;
    }
}
