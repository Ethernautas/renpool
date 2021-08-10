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
    function register(address _darknodeID, bytes calldata _publicKey) external;
}

contract RenPool {
    address public renTokenAddr;
    address public darknodeRegistryAddr;
    address public owner; // This will be our address, in case we need to destroy the contract and refund everyone
    address public admin;
    ERC20 public renToken;
    DarknodeRegistry public darknodeRegistry;
    mapping(address => uint) public balances;
    mapping(address => uint) public withdrawRequests;
    uint public bond;
    uint public totalPooled;
    bool public isLocked;
    uint public ownerFee; // Percentage
    uint public adminFee; // Percentage
    uint8 public constant DECIMALS = 18;

    event RenDeposited(address indexed _from, uint _amount);
    event RenWithdrawn(address indexed _from, uint _amount);
    event PoolLocked();
    event PoolUnlocked();

    constructor(
        address _renTokenAddr,
        address _darknodeRegistryAddr,
        address _owner,
        uint _bond
    ) public {
        renTokenAddr = _renTokenAddr;
        darknodeRegistryAddr = _darknodeRegistryAddr;
        owner = _owner;
        admin = msg.sender;
        renToken = ERC20(_renTokenAddr);
        darknodeRegistry = DarknodeRegistry(_darknodeRegistryAddr);
        bond = _bond;
        isLocked = false;
        totalPooled = 0;
        ownerFee = 5;
        adminFee = 5;
    }

    modifier onlyOwnerAdmin() {
        require (msg.sender == owner || msg.sender == admin, "Caller is not owner nor admin");
        _;
    }

    modifier onlyOwner() {
        require (msg.sender == owner, "Caller is not owner");
        _;
    }

    function _lockPool() private {
        isLocked = true;
        emit PoolLocked();
    }

    /**
     * @notice User needs to give allowance before calling this method. See 'approve'
     * method at https://ethereum.org/nl/developers/tutorials/erc20-annotated-code/
     */
    function deposit(uint _amount) external {
        address sender = msg.sender;

        require(_amount > 0, "Invalid ammount");
        require(_amount + totalPooled <= bond, "Amount surpasses pool bond");
        require(isLocked == false, "Pool is locked");

        balances[sender] += _amount; // TODO: do we need to use safeMath?
        totalPooled += _amount;

        renToken.transferFrom(sender, address(this), _amount);

        emit RenDeposited(sender, _amount);

        if (totalPooled == bond) {
            _lockPool();
        }
    }

    function withdraw(uint _amount) external {
        address sender = msg.sender;
        uint senderBalance = balances[sender];

        require(senderBalance > 0 && senderBalance >= _amount, "Insufficient funds");
        require(isLocked == false, "Pool is locked");

        totalPooled -= _amount;
        balances[sender] -= _amount;

        renToken.transfer(sender, _amount);

        emit RenWithdrawn(sender, _amount);
    }

    function requestWithdraw(uint _amount) external {
        address sender = msg.sender;
        uint senderBalance = balances[sender];

        require(senderBalance > 0 && senderBalance >= _amount, "Insufficient funds");
        require(isLocked == true, "Pool is not locked");

        withdrawRequests[sender] = _amount;
    }

    function fulfillWithdrawRequest(address _target) external {
        address sender = msg.sender;
        uint amount = withdrawRequests[_target]; // this could not be defined and make sure amount > 0

        require(isLocked == true, "Pool is not locked");
        require(renToken.transferFrom(sender, address(this), amount));

        // Transfering balance
        balances[sender] += amount;
        balances[_target] -= amount;

        // withdraw funds
        renToken.transfer(_target, amount);

        // removing the user in the queue
        delete withdrawRequests[_target];
    }

    function balanceOf(address _addr) external view returns(uint) {
        return balances[_addr];
    }

    function approveBondTransfer() external onlyOwnerAdmin returns(bool) {
        renToken.approve(darknodeRegistryAddr, bond);
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
