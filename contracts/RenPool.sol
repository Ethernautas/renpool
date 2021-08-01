pragma solidity ^0.8.0;

contract RenPool {
    address public owner; // This will be our address, in case we need to destroy the contract and refund everyone
    address public admin;
    mapping(address => uint) public balances;
    uint public totalPooled;
    bool public isLocked;
    uint public fee;
    uint public target;

    struct WithdrawRequest{
        address user;
        uint amount;
    }
    
    WithdrawRequest[] public withdrawRequests;

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
        require(!isLocked);

        balances[msg.sender] += amount;
        totalPooled += amount;

        emit RenDeposited(msg.sender, amount);

        if(totalPooled == target){
            _lockPool(); // Locking the pool is target is met
        }

    }

    function fullfillWithdrawRequest(uint _withdrawId) external payable{
            // If pool is locked, look if there is a withdraw queue
            require(isLocked);
            require(withdrawRequests.length > 0);

            uint amount = msg.value;

            // Maybe storage is better?
            WithdrawRequest memory withdrawRequest = withdrawRequests[_withdrawId];
            require(withdrawRequest.amount == amount); // User has to exactly replace the user that wants out
            balances[msg.sender] += amount;
            balances[withdrawRequest.user] -= amount;


            // removing the user in the queue

            // first in line withdraw funds
            payable(withdrawRequest.user).transfer(withdrawRequest.amount);

    }

    function withdraw(uint _amount) external payable {
        require(balances[msg.sender] > 0 && balances[msg.sender] >=  _amount);
        address payable user = payable(msg.sender);

        if(!isLocked){
            // The pool is not locked, user can withdraw right away
            totalPooled -= _amount;
            balances[msg.sender] += _amount;

            // Again, we will transfer Ren no eth, will need to implement ren's ERC-20 smart contract later

            user.transfer(_amount);
        }
        else{
            // Pool is locked, withdraw will be put in the queue
            withdrawRequests.push(WithdrawRequest(user, _amount));

        }


    }

}