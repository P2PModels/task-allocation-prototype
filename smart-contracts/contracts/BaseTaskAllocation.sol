pragma solidity ^0.8.4;

abstract contract BaseTaskAllocation {
    /// Events
    event TasksRestart(address indexed entity);
    event ApiUrlSet(string apiUrl);

    /// State
    string public apiUrl;

    /// ACL
    // bytes32 constant public ALLOCATE_TASK_ROLE = keccak256("ALLOCATE_TASK_ROLE");
    // bytes32 constant public GET_TASK_ROLE = keccak256("GET_TASK_ROLE");
    // bytes32 constant public CREATE_TASK_ROLE = keccak256("CREATE_TASK_ROLE");
    // bytes32 constant public CREATE_USER_ROLE = keccak256("CREATE_USER_ROLE");
    // bytes32 constant public RESTART_APP_ROLE = keccak256("RESTART_APP_ROLE");

    function setApiUrl(string calldata _apiUrl) external {
        apiUrl = _apiUrl;
        emit ApiUrlSet(_apiUrl);
    }

    function restart() virtual external {}
}
