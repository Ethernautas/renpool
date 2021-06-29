pragma solidity ^0.8.0;

import 'OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/ERC20.sol';
// ^ install via `brownie pm install OpenZeppelin/openzeppelin-contracts@4.0.0`
// See https://docs.openzeppelin.com/contracts/4.x/erc20

contract RenToken is ERC20 {
  constructor() ERC20 ('REN', 'REN') {
    // See REN decimals and totalSupply at https://etherscan.io/token/0x408e41876cccdc0f92210600ef50372656052a38#readContract
    _mint(msg.sender, 1e28);
  }
}
