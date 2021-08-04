pragma solidity ^0.8.0;

import "./RenToken.sol";


contract RenPool {
    ERC20 public renToken;
    address public owner; // This will be our address, in case we need to destroy the contract and refund everyone
    address public admin;
    mapping(address => uint) public balanceOf;
    uint public totalPooled;
    bool public isLocked;
    uint public ownerFee;
    uint public adminFee;
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


    constructor(address _renTokenAddr, address _owner, uint _target) {
        renToken = RenToken(_renTokenAddr);
        target = _target; // 100k ren for darknode
        owner = _owner; // 100k ren for
        admin = msg.sender;
        isLocked = false;
        totalPooled = 0;
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

    function deposit(uint _amount) external payable{
        // We'll need to implement to implement the ren token 

        // 0x408e41876cccdc0f92210600ef50372656052a38
        require (_amount > 0, "Invalid ammount amount.");
        require (_amount + totalPooled <= target, "Amount surpasses pool target");
        require(!isLocked);

        require(renToken.transferFrom(msg.sender, address(this), _amount));

        balanceOf[msg.sender] += _amount;
        totalPooled += _amount;

        emit RenDeposited(msg.sender, _amount);

        if(totalPooled == target){
            _lockPool(); // Locking the pool is target is met
        }

    }

    function fullfillWithdrawRequest(uint _withdrawId) external payable{
            // If pool is locked, look if there is a withdraw queue
            require(isLocked);
            require(withdrawRequests.length > 0);

            // Maybe storage is better?
            WithdrawRequest memory withdrawRequest = withdrawRequests[_withdrawId];

            require(renToken.transferFrom(msg.sender, address(this), withdrawRequest.amount));

            balanceOf[msg.sender] += withdrawRequest.amount;
            balanceOf[withdrawRequest.user] -= withdrawRequest.amount;

    
            // withdraw funds
            renToken.transfer(withdrawRequest.user, withdrawRequest.amount);

            // removing the user in the queue
            delete(withdrawRequests[_withdrawId]);

    }

    function withdraw(uint _amount) external {
        require(balanceOf[msg.sender] > 0 && balanceOf[msg.sender] >=  _amount);

        if(!isLocked){
            // The pool is not locked, user can withdraw right away
            totalPooled -= _amount;
            balanceOf[msg.sender] -= _amount;

            renToken.transfer(msg.sender, _amount);

        }
        else{
            // Pool is locked, withdraw will be put in the queue
            withdrawRequests.push(WithdrawRequest(msg.sender, _amount));

        }


    }

}