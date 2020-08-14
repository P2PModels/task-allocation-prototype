pragma solidity ^0.4.24;


contract BaseTaskAllocation {
    /// Events
    event TasksRestart(address indexed entity);
    event ApiUrlSet(string apiUrl);

    /// State
    string public apiUrl;

    /// ACL
    bytes32 constant public ALLOCATE_TASK_ROLE = keccak256("ALLOCATE_TASK_ROLE");
    bytes32 constant public GET_TASK_ROLE = keccak256("GET_TASK_ROLE");

    function setApiUrl(string _apiUrl) external {
        apiUrl = _apiUrl;
        emit ApiUrlSet(_apiUrl);
    }

    function restart() external;
}
