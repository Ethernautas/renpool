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


        if(!isLocked){
            // If pool is not locked, funds are still necesarry so no need to worry about the withdraw queue

            balances[msg.sender] += amount;
            totalPooled += amount;

            emit RenDeposited(msg.sender, amount);

            if(totalPooled == target){
                _lockPool(); // Locking the pool is target is met
            }
        }
        else{
            // If pool is locked, look if there is a withdraw queue
            require(withdrawRequests.length > 0);

            WithdrawRequest firstInLine = withdrawRequests[0];
            // For now, the user who wants to get in a locked pool has to
            // replace exactly the first in lines
            require(firstInLine.amount == msg.amount);
            balances[msg.sender] += amount;
            balances[firstInLine.user] -= amount;

            // first in line withdraw funds
            firstInLine.user.transfer(firstInLine.amount);
        }



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
            withdrawRequests.push(WithdrawRequest(user, _amount))

        }


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