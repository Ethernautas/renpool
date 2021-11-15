pragma solidity ^0.5.17;

/// @notice ClaimlessRewards is intended to replace the DarknodePayment
/// contract. It's to main improvements are:
/// 1) no longer requiring nodes to call `claim` each epoch, and
/// 2) allowing for a community fund to earn a proportion of the rewards.
interface IClaimlessRewards {
    function darknodeBalances(address _node, address _token) external view returns (uint256);

    /// @notice Withdraw multiple assets for each darknode in the list.
    /// The interface has been kept the same as the DarknodePayment contract
    /// for backward-compatibility.
    function withdrawMultiple(address[] calldata _nodes, address[] calldata _tokens) external;

    /// @notice Withdraw the provided asset for the given darknode.
    /// The interface has been kept the same as the DarknodePayment contract
    /// for backward-compatibility.
    function withdraw(address _node, address _token) external;
}
