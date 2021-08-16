pragma solidity 0.5.16;

interface DarknodeRegistry {
    function register(address _darknodeID, bytes calldata _publicKey) external;
    function deregister(address _darknodeID) external;
    function refund(address _darknodeID) external;
}
