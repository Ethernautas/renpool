pragma solidity ^0.8.0;

import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/ERC20.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/IERC20.sol";

contract RenPool {
    ERC20 public renToken;
    address public owner; // This will be our address, in case we need to destroy the contract and refund everyone
    address public admin;
    mapping(address => uint) public balances;
    uint public totalPooled;
    bool public isLocked;
    uint public ownerFee; // Percentage
    uint public adminFee; // Percentage
    uint public target;
    uint8 public constant DECIMALS = 18;
    uint public constant DEFAULT_TARGET = 100_000 * 10 ** uint(DECIMALS); // 100k ren for darknode

    struct WithdrawRequest {
        address user;
        uint amount;
    }

    WithdrawRequest[] public withdrawRequests;

    event RenDeposited(address from, uint amount); // Why add the time?
    event RenWithdraw(address from, uint amount);
    event PoolTargetReached();
    event PoolLocked();
    event PoolUnlocked();

    constructor(address _renTokenAddr) {
        renToken = ERC20(_renTokenAddr);
        // ^ We'll need to implement the ren token
        // 0x408e41876cccdc0f92210600ef50372656052a38
        target = DEFAULT_TARGET; // TODO: we need a set method to be able to update this value
        owner = msg.sender; // TODO: this should be hardcoded in the contract
        admin = msg.sender;
        isLocked = false;
        totalPooled = 0;
        ownerFee = 5;
        adminFee = 5;
    }

    modifier onlyAdmin() {
        require (msg.sender == admin, "You must be the admin of the pool to execute this action.");
        _;
    }

    modifier onlyOwner() {
        require (msg.sender == owner, "You must be the owner to execute this action.");
        _;
    }

    function _lockPool() private {
        isLocked = true;
        emit PoolLocked();
    }

    function deposit(uint _amount) external {
        address addr = msg.sender;

        require (_amount > 0, "Invalid ammount");
        require (_amount + totalPooled < target, "Amount surpasses pool target");
        require (isLocked == false, "Pool is locked");

        renToken.transferFrom(addr, this, _amount);
        // ^ user needs approve this transaction first.
        // See: https://ethereum.org/nl/developers/tutorials/erc20-annotated-code/
        balances[addr] += _amount;
        totalPooled += _amount;

        emit RenDeposited(addr, _amount);

        if (totalPooled == target){
            _lockPool(); // Locking the pool if target is met
        }
    }

    function requestDeposit(uint _amount) external {
        require (amount > 0, "Invalid ammount");
        require (isLocked == true, "Pool is not locked");
        require(withdrawRequests.length > 0);

        WithdrawRequest firstInLine = withdrawRequests[0];
        // For now, the user who wants to get in a locked pool has to
        // replace exactly the first in lines
        require(firstInLine.amount == _amount);
        balances[msg.sender] += _amount;
        balances[firstInLine.user] -= _amount;

        // First in line withdraw funds
        firstInLine.user.transfer(firstInLine.amount);
    }

    function requestWithdraw(uint _amount) external {
        require(balances[msg.sender] > 0 && balances[msg.sender] >=  _amount);
        address payable user = payable(msg.sender);

        withdrawRequests.push(WithdrawRequest(user, _amount));
    }

    function withdraw(uint _amount) external {
        require(balances[msg.sender] > 0 && balances[msg.sender] >=  _amount);
        address payable user = payable(msg.sender);

        totalPooled -= _amount;
        balances[msg.sender] += _amount;

        // Again, we will transfer Ren no eth, will need to implement ren's ERC-20 smart contract later

        user.transfer(_amount);
    }

    // Function to remove element of array and changing the order accordingly
    function _remove(WithdrawRequest index)  returns(WithdrawRequest[]) {
        if (index >= array.length) return;

        for (uint i = index; i<array.length-1; i++){
            array[i] = array[i+1];
        }
        array.length--;
        return array;
    }

}
