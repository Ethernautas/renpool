pragma solidity ^0.8.0;

/*
* Observation, ideally we should import both RenToken and DarknodeRegistry interfaces
* from 'renproject/darknode-sol@1.0.1'. Unfortunately, said interfaces are not being exposed.
*/
import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IDarknodeRegistry.sol";
// TODO: use safeMath?

contract RenPool {
    uint8 public constant DECIMALS = 18;

    address public renTokenAddr;
    address public darknodeRegistryAddr;
    address public owner; // This will be our address, in case we need to destroy the contract and refund everyone
    address public nodeOperator;
    address public darknodeID;

    bytes public publicKey;
    // ^ What happens if we register and deregister and register back again?

    uint public bond;
    uint public totalPooled;
    uint public ownerFee; // Percentage
    uint public nodeOperatorFee; // Percentage

    bool public isLocked;

    mapping(address => uint) public balances;
    mapping(address => uint) public withdrawRequests;

    IERC20 public renToken;
    IDarknodeRegistry public darknodeRegistry;

    event RenDeposited(address indexed _from, uint _amount);
    event RenWithdrawn(address indexed _from, uint _amount);
    event EthDeposited(address indexed _from, uint _amount);
    event EthWithdrawn(address indexed _from, uint _amount);
    event PoolLocked();
    event PoolUnlocked();

    /**
     * TODO
     */
    constructor(
        address _renTokenAddr,
        address _darknodeRegistryAddr,
        address _owner,
        uint _bond
    )
    {
        renTokenAddr = _renTokenAddr;
        darknodeRegistryAddr = _darknodeRegistryAddr;
        owner = _owner;
        nodeOperator = msg.sender;
        renToken = IERC20(_renTokenAddr);
        darknodeRegistry = IDarknodeRegistry(_darknodeRegistryAddr);
        bond = _bond;
        isLocked = false;
        totalPooled = 0;
        ownerFee = 5;
        nodeOperatorFee = 5;

        // TODO: register pool into RenPoolStore
    }

    modifier onlyNodeOperator() {
        require (
            msg.sender == nodeOperator,
            "Caller is not nodeOperator"
        );
        _;
    }

    modifier onlyOwnerNodeOperator() {
        require (
            msg.sender == owner || msg.sender == nodeOperator,
            "Caller is not owner/nodeOperator"
        );
        _;
    }

    modifier onlyOwner() {
        require (
            msg.sender == owner,
            "Caller is not owner"
        );
        _;
    }

    /**
     * @notice Lock pool so that no direct deposits/withdrawals can
     * be performed.
     */
    function _lockPool() private {
        isLocked = true;
        emit PoolLocked();
    }

    function unlockPool() external onlyOwnerNodeOperator {
        require(renToken.balanceOf(address(this)) > 0, "Pool balance is zero");
        isLocked = false;
        emit PoolUnlocked();
    }

    /**
     * @notice Deposit REN into the RenPool contract. Before depositing,
     * the transfer must be approved in the REN contract. In case the
     * predefined bond is reached, the pool is locked preventing any
     * further deposits or withdrawals.
     *
     * @param _amount The amount of REN to be deposited into the pool.
     */
    function deposit(uint _amount) external {
        address sender = msg.sender;

        require(isLocked == false, "Pool is locked");
        require(_amount > 0, "Invalid amount");
        require(_amount + totalPooled <= bond, "Amount surpasses bond");

        balances[sender] += _amount;
        totalPooled += _amount;

        require(
            renToken.transferFrom(sender, address(this), _amount) == true,
            "Deposit failed"
        );

        emit RenDeposited(sender, _amount);

        if (totalPooled == bond) {
            _lockPool();
        }
    }

    /**
     * TODO
     */
    function withdraw(uint _amount) external {
        address sender = msg.sender;
        uint senderBalance = balances[sender];

        require(senderBalance > 0 && senderBalance >= _amount, "Insufficient funds");
        require(isLocked == false, "Pool is locked");

        totalPooled -= _amount;
        balances[sender] -= _amount;

        require(
            renToken.transfer(sender, _amount) == true,
            "Withdraw failed"
        );

        emit RenWithdrawn(sender, _amount);
    }

    /**
     * TODO
     * @dev Users can have up to a single request active. In case of several
     * calls to this method, only the last request will be preserved.
     */
    function requestWithdraw(uint _amount) external {
        address sender = msg.sender;
        uint senderBalance = balances[sender];

        require(senderBalance > 0 && senderBalance >= _amount, "Insufficient funds");
        require(isLocked == true, "Pool is not locked");

        withdrawRequests[sender] = _amount;

        // TODO emit event
    }

    /**
     * TODO
     */
    function fulfillWithdrawRequest(address _target) external {
        address sender = msg.sender;
        uint amount = withdrawRequests[_target];
        // ^ This could not be defined plus make sure amount > 0
        // TODO: make sure user cannot fullfil his own request
        // TODO: add test for when _target doesn't have an associated withdrawRequest

        require(isLocked == true, "Pool is not locked");

        balances[sender] += amount;
        balances[_target] -= amount;
        delete withdrawRequests[_target];

        // Transfer funds from sender to _target
        require(
            renToken.transferFrom(sender, address(this), amount) == true,
            "Deposit failed"
        );
        require(
            renToken.transfer(_target, amount) == true,
            "Refund failed"
        );

        // TODO emit event
    }

    // TODO: cancelWithdrawRequest
    // TODO: getWithdrawRequests

    /**
     * @notice Return REN balance for the given address.
     *
     * @param _target Address to be queried.
     */
    function balanceOf(address _target) external view returns(uint) {
        return balances[_target];
    }

    /**
     * @notice Transfer bond to the darknodeRegistry contract prior to
     * registering the darknode.
     */
    function approveBondTransfer() external onlyNodeOperator {
        require(isLocked == true, "Pool is not locked");

        require(
            renToken.approve(darknodeRegistryAddr, bond) == true,
            "Bond transfer failed"
        );
    }

    /**
     * @notice Register a darknode and transfer the bond to the darknodeRegistry
     * contract. Before registering, the bond transfer must be approved in the
     * darknodeRegistry contract (see approveTransferBond). The caller must
     * provide a public encryption key for the darknode. The darknode will remain
     * pending registration until the next epoch. Only after this period can the
     * darknode be deregistered. The caller of this method will be stored as the
     * owner of the darknode.
     *
     * @param _darknodeID The darknode ID that will be registered.
     * @param _publicKey The public key of the darknode. It is stored to allow
     * other darknodes and traders to encrypt messages to the trader.
     */
    function registerDarknode(address _darknodeID, bytes calldata _publicKey) external onlyNodeOperator {
        require(isLocked == true, "Pool is not locked");

        darknodeRegistry.register(_darknodeID, _publicKey);

        darknodeID = _darknodeID;
        publicKey = _publicKey;
    }

    /**
     * @notice Deregister a darknode. The darknode will not be deregistered
     * until the end of the epoch. After another epoch, the bond can be
     * refunded by calling the refund method.
     *
     * @dev We don't reset darknodeID/publicKey values after deregistration in order
     * to being able to call refund.
     */
    function deregister() external onlyOwnerNodeOperator {
        darknodeRegistry.deregister(darknodeID);
    }

    /**
     * @notice Refund the bond of a deregistered darknode. This will make the
     * darknode available for registration again. Anyone can call this function
     * but the bond will always be refunded to the darknode owner.
     *
     * @dev No need to reset darknodeID/publicKey values after refund.
     */
    function refund() external {
        darknodeRegistry.refund(darknodeID);
    }

    /**
     * @notice Allow ETH deposits in case gas is necessary to pay for transactions.
     */
    receive() external payable {
        emit EthDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Allow node operator to withdraw any remaining gas.
     */
    function withdrawGas() external onlyNodeOperator {
        uint balance = address(this).balance;
        payable(nodeOperator).transfer(balance);
        emit EthWithdrawn(nodeOperator, balance);
    }
}
