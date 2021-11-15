const RenToken = require('@renproject/sol/build/testnet/RenToken.json');
const hre = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
const { ethers } = hre;

describe('RenToken contract check', function () {

  const renTokenAddr = hre.network.config.renTokenAddr;
  const topRenTokenHolder = hre.network.config.topRenTokenHolder;

  const chainId = hre.network.config.chainId;

  expect(Object.keys(RenToken.networks)).to.include(chainId.toString());
  expect(RenToken.networks[chainId].address).to.equalIgnoreCase(renTokenAddr);

  let renToken;

  before(async () => {
    const [owner] = await ethers.getSigners();
    renToken = new ethers.Contract(renTokenAddr, RenToken.abi, owner);
  });

  it(`should check the address ${renTokenAddr} is a RenToken contract`, async function () {
    expect(await renToken.name()).to.equal('Republic Token');
    expect(await renToken.symbol()).to.equal('REN');
  });

  it(`should check the top holder account ${topRenTokenHolder} has enough tokens`, async () => {
    expect(await renToken.balanceOf(topRenTokenHolder)).to.be.above(0);
  });

});
