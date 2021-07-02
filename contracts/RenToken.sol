pragma solidity ^0.8.0;

import 'OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/ERC20.sol';
// ^ install via `brownie pm install OpenZeppelin/openzeppelin-contracts@4.0.0`
// See https://docs.openzeppelin.com/contracts/4.x/erc20

// Source: https://github.com/renproject/darknode-sol/blob/3ec7d69e7778396c6661d35e02ecf91f50e90762/contracts/RenToken/RenToken.sol
contract RenToken is ERC20 {
    string private constant _name = 'Republic Token';
    string private constant _symbol = 'REN';
    uint8 private constant _decimals = 18;
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**uint256(_decimals);

    address public owner;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**uint256(_decimals);
    // ^ Added so that we can have a faucet

    constructor() ERC20 (_name, _symbol) {
        owner = msg.sender;
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function getFromFaucet() public returns (bool) {
        address beneficiary = msg.sender;

        require(this.balanceOf(owner) >= FAUCET_AMOUNT, 'The faucet is empty');

        _transfer(owner, beneficiary, FAUCET_AMOUNT);
        emit Transfer(owner, beneficiary, FAUCET_AMOUNT);

        return true;
    }
}
