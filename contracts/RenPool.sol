pragma solidity ^0.8.0;

import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/ERC20.sol";

interface DarknodeRegistry {
    /**
     * @notice Register a darknode and transfer the bond to this contract.
     * Before registering, the bond transfer must be approved in the REN
     * contract. The caller must provide a public encryption key for the
     * darknode. The darknode will remain pending registration until the next
     * epoch. Only after this period can the darknode be deregistered. The
     * caller of this method will be stored as the owner of the darknode.
     *
     * @param _darknodeID The darknode ID that will be registered.
     * @param _publicKey The public key of the darknode. It is stored to allow
     *        other darknodes and traders to encrypt messages to the trader.
     */
    function register(address _darknodeID, bytes calldata _publicKey) external {}
}

contract RenPool {
    address public renTokenAddr;
    address public darknodeRegistryAddr;
    address public owner; // This will be our address, in case we need to destroy the contract and refund everyone
    address public admin;
    ERC20 public renToken; // TODO: Probably use RenToken from https://github.com/renproject/darknode-sol/blob/master/contracts/RenToken/RenToken.sol
    DarknodeRegistry public darknodeRegistry;
    mapping(address => uint) public balances;
    uint public target;
    uint public totalPooled;
    bool public isLocked;
    uint public ownerFee; // Percentage
    uint public adminFee; // Percentage
    uint8 public constant DECIMALS = 18;

    event RenDeposited(address indexed _from, uint _amount);
    event RenWithdrawn(address indexed _from, uint _amount);
    event PoolLockied();
    event PoolUnlocked();

    constructor(
        address _renTokenAddr,
        address _darknodeRegistryAddr,
        address _owner,
        uint _target
    ) {
        renTokenAddr = _renTokenAddr;
        darknodeRegistryAddr = _darknodeRegistryAddr;
        owner = _owner;
        admin = msg.sender;
        renToken = ERC20(_renTokenAddr);
        darknodeRegistry = DarknodeRegistry(_darknodeRegistryAddr);
        target = _target; // TODO: we need a set method to be able to update this value
        isLocked = false;
        totalPooled = 0;
        ownerFee = 5;
        adminFee = 5;
    }

    modifier onlyOwnerAdmin() {
        require (
            msg.sender == owner || msg.sender == admin,
            "You must be the admin of the pool to execute this action."
        );
        _;
    }

    modifier onlyOwner() {
        require (
            msg.sender == owner,
            "You must be the owner to execute this action."
        );
        _;
    }

    function _lockPool() private {
        isLocked = true;
        emit PoolLocked();
    }

    function deposit(uint _amount) external {
        address sender = msg.sender;

        require(_amount > 0, "Invalid ammount");
        require(_amount + totalPooled < target, "Amount surpasses pool target");
        require(isLocked == false, "Pool is locked");

        renToken.transferFrom(sender, address(this), _amount);
        // ^ user needs to give allowance first for this transaction to pass.
        // See: https://ethereum.org/nl/developers/tutorials/erc20-annotated-code/
        balances[sender] += _amount; // TODO: do we need to use safeMath?
        totalPooled += _amount;

        emit RenDeposited(sender, _amount);

        if (totalPooled == target) {
            _lockPool(); // Locking the pool if target is met
        }
    }

    function withdraw(uint _amount) external {
        address sender = msg.sender;
        uint senderBalance = balances[sender];

        require(senderBalance > 0 && senderBalance >= _amount, "Insufficient funds");
        require(isLocked == false, "Pool is locked");

        renToken.transfer(sender, _amount);
        totalPooled -= _amount;
        balances[sender] -= _amount;

        emit RenWithdrawn(sender, _amount);
    }

    function balanceOf(address _addr) external view returns(uint) {
        return balances[_addr];
    }

    function approveBondTransfer() external onlyOwnerAdmin returns(bool) {
        renToken.approve(darknodeRegistryAddr, target);
        // ^ msg.sender == address(this), right ? ie, the RenPool contract address is the sender and not the admin/owner who initiated this transaction?
        return true;
    }

    /**
     * @notice approveBondTransfer needs to be called before registerDarknode
     */
    function registerDarknode(address _darknodeID, bytes calldata _publicKey) external onlyOwnerAdmin returns(bool) {
        // See: https://docs.soliditylang.org/en/v0.6.2/contracts.html#receive-ether-function
        // What if this function is called more then once?
        darknodeRegistry.register(_darknodeID, _publicKey);
        // ^ msg.sender == address(this), right ? ie, the RenPool contract address is the sender and not the admin/owner who initiated this transaction?
        return true;
    }
}
