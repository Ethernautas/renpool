pragma solidity ^0.8.0;

interface IDarknodeRegistry {
    /**
     * @notice Register a darknode and transfer the bond to the REN contract.
     * Before registering, the bond transfer must be approved in the REN
     * contract. The caller must provide a public encryption key for the
     * darknode. The darknode will remain pending registration until the next
     * epoch. Only after this period can the darknode be deregistered. The
     * caller of this method will be stored as the owner of the darknode.
     *
     * @param _darknodeID The darknode ID that will be registered.
     * @param _publicKey The public key of the darknode. It is stored to allow
     * other darknodes and traders to encrypt messages to the trader.
     */
    function register(address _darknodeID, bytes calldata _publicKey) external;

    /**
     * @notice Retrieves the address of the account that registered a darknode.
     *
     * @param _darknodeID The ID of the darknode to retrieve the owner for.
     */
    function getDarknodeOwner(address _darknodeID) external view returns (address payable);

    /**
     * @notice Deregister a darknode. The darknode will not be deregistered
     * until the end of the epoch. After another epoch, the bond can be
     * refunded by calling the refund method.
     *
     * @param _darknodeID The darknode ID that will be deregistered. The caller
     * of this method store.darknodeRegisteredAt(_darknodeID) must be
     * the owner of this darknode.
     */
    function deregister(address _darknodeID) external;

    /**
     * @notice Refund the bond of a deregistered darknode. This will make the
     * darknode available for registration again. Anyone can call this function
     * but the bond will always be refunded to the darknode owner.
     *
     * @param _darknodeID The darknode ID that will be refunded. The caller
     * of this method must be the owner of this darknode.
     */
    function refund(address _darknodeID) external;

    /**
     * @notice Returns whether a darknode is scheduled to become registered
     * at next epoch.
     *
     * @param _darknodeID The ID of the darknode to return
     */
    function isPendingRegistration(address _darknodeID) external view returns (bool);

    /**
     * @notice Returns if a darknode is in the registered state.
     */
    function isRegistered(address _darknodeID) external view returns (bool);

    /**
     * @notice Progress the epoch if it is possible to do so. This captures
     * the current timestamp and current blockhash and overrides the current
     * epoch.
     */
    function epoch() external;
}
