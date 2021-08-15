pragma solidity ^0.8.0;

interface IDarknodeRegistry {
    function register(address _darknodeID, bytes calldata _publicKey) external;
    function deregister(address _darknodeID) external;
    function refund(address _darknodeID) external;
}
