pragma solidity ^0.8.0;

contract RenPool {
    address public owner; // This will be our address, in case we need to destroy the contract and refund everyone
    address public admin;
    mapping(address => uint) public balances;
    uint public totalPooled;
    bool public isLocked;
    uint public fee;
    uint public target;

    event RenDeposited(address from, uint amount); // Why add the time?
    event RenWithdraw(address from, uint amount);
    event PoolTargetReached();
    event PoolLocked();
    event PoolUnlocked();

    constructor() {
        target = 100000; // 100k ren for darknode
        owner = msg.sender;
        isLocked = false;
        totalPooled = 0;
        fee = 1;
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

    function deposit() external payable{
        // !! this is coded as if we were transfering ETH and not ren
        // We'll need to implement to implement the ren token 
        // 0x408e41876cccdc0f92210600ef50372656052a38
        uint amount = msg.value;

        require (amount > 0, "Invalid ammount amount.");
        require (amount + totalPooled < target, "Amount surpasses pool target");

        balances[msg.sender] += amount;
        totalPooled += amount;

        emit RenDeposited(msg.sender, amount);

        if(totalPooled == target){
            _lockPool();
        }

    }


}