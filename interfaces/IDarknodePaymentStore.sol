pragma solidity 0.5.17;

/**
 * @notice DarknodePaymentStore is responsible for tracking balances which have
 *         been allocated to the darknodes. It is also responsible for holding
 *         the tokens to be paid out to darknodes.
 */
interface IDarknodePaymentStore {
    /// @notice Mapping of darknode -> token -> balance.
    // mapping(address => mapping(address => uint256)) public darknodeBalances;

    /// @notice Mapping of token -> lockedAmount.
    // mapping(address => uint256) public lockedBalances;
}
