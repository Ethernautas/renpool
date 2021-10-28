pragma solidity ^0.8.0;

import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/ERC20.sol";

/*
* This is a naive implementation of the REN token contract for testing purposes only.
* In production we should rely on the ERC20 interface or better the REN token interface itself.
* Source: https://github.com/renproject/darknode-sol/blob/3ec7d69e7778396c6661d35e02ecf91f50e90762/contracts/RenToken/RenToken.sol
*/
// TODO: move to contracts/tests folder and rename to RenTokenMock
contract RenToken is ERC20 {
	string private constant NAME = "Republic Token";
	string private constant SYMBOL = "REN";
	uint8 private constant DECIMALS = 18;
	uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**uint256(DECIMALS);

	address public owner;
	uint256 public constant FAUCET_AMOUNT = 100000 * 10**uint256(DECIMALS);
	// ^ Added so that we can have a faucet

	constructor() ERC20 (NAME, SYMBOL) {
		owner = msg.sender;
		_mint(msg.sender, INITIAL_SUPPLY);
	}

	/**
	 * @notice Simple faucet implementation for testing purposes only.
	 */
	function callFaucet() public returns (bool) {
		address beneficiary = msg.sender;

		require(this.balanceOf(owner) >= FAUCET_AMOUNT, "The faucet is empty");

		_transfer(owner, beneficiary, FAUCET_AMOUNT);
		emit Transfer(owner, beneficiary, FAUCET_AMOUNT);

		return true;
	}
}
