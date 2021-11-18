const { ethers, network: { config: { chainId, build, renTokenAddr, topRenTokenHolderAddr } } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
const RenToken = require(`@renproject/sol/build/${build}/RenToken.json`);

describe('RenProject/RenToken contract check', () => {

  let renToken;

  before(async () => {
    const [owner] = await ethers.getSigners();
    renToken = new ethers.Contract(renTokenAddr, RenToken.abi, owner);
  });

  it(`should include chain ID ${chainId} within contract networks`, async () => {
    expect(Object.keys(RenToken.networks)).to.include(chainId.toString());
  });

  it(`should check contract address is ${renTokenAddr}`, async () => {
    expect(RenToken.networks[chainId].address).to.equalIgnoreCase(renTokenAddr);
  });

  it(`should check the address ${renTokenAddr} is an ERC20 RenToken contract`, async () => {
    expect(await renToken.name()).to.equal('Republic Token');
    expect(await renToken.symbol()).to.equal('REN');
  });

  it(`should check the top holder account ${topRenTokenHolderAddr} has enough REN tokens`, async () => {
    expect(await renToken.balanceOf(topRenTokenHolderAddr)).to.be.above(0);
  });

});
