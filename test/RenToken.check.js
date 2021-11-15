const { ethers, network: { config: { chainId, renTokenAddr, topRenTokenHolder } } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
const RenToken = require('@renproject/sol/build/testnet/RenToken.json');

describe('RenToken contract check', function () {

  let renToken;

  before(async () => {
    const [owner] = await ethers.getSigners();
    renToken = new ethers.Contract(renTokenAddr, RenToken.abi, owner);
  });

  it(`should validate chain ID is ${chainId} and contract address is ${renTokenAddr}`, async () => {
    expect(Object.keys(RenToken.networks)).to.include(chainId.toString());
    expect(RenToken.networks[chainId].address).to.equalIgnoreCase(renTokenAddr);
  });

  it(`should check the address ${renTokenAddr} is a RenToken contract`, async function () {
    expect(await renToken.name()).to.equal('Republic Token');
    expect(await renToken.symbol()).to.equal('REN');
  });

  it(`should check the top holder account ${topRenTokenHolder} has enough tokens`, async () => {
    expect(await renToken.balanceOf(topRenTokenHolder)).to.be.above(0);
  });

});
