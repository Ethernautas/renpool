const hre = require('hardhat');
const { expect } = require('chai');
const RenToken = require('@renproject/sol/build/testnet/RenToken.json');

const { ethers } = hre;
const bn = ethers.BigNumber.from;

const DECIMALS = 18;
const DIGITS = bn(10).pow(DECIMALS);
const POOL_BOND = bn(100_000).mul(DIGITS);

describe('RenPool contract', function () {

  const renTokenAddr = hre.network.config.renTokenAddr;
  const darknodeRegistryAddr = renTokenAddr;
  const darknodePaymentAddr = renTokenAddr;
  const claimRewardsAddr = renTokenAddr;
  const gatewayAddr = renTokenAddr;

  const renToken = new ethers.Contract(renTokenAddr, RenToken.abi);

  let owner, nodeOperator, alice;
  let renPool;

  before(async () => {
    [owner, nodeOperator, alice] = await ethers.getSigners();

    const topRenTokenHolder = hre.network.config.topRenTokenHolder;
    expect(await renToken.connect(owner).balanceOf(topRenTokenHolder)).to.be.above(0);
    await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [topRenTokenHolder] });

    const signer = await ethers.getSigner(topRenTokenHolder);
    for (const user of (await ethers.getSigners()).slice(2)) {
      expect(await renToken.connect(owner).balanceOf(user.address)).to.equal(0);

      const amount = POOL_BOND.mul(5);
      await renToken.connect(signer).transfer(user.address, amount);
      expect(await renToken.connect(owner).balanceOf(user.address)).to.equal(amount);
    }

    await hre.network.provider.request({ method: 'hardhat_stopImpersonatingAccount', params: [topRenTokenHolder] });
  });

  beforeEach(async () => {
    renPool = await (await ethers.getContractFactory('RenPool')).connect(nodeOperator).deploy(
      renTokenAddr,
      darknodeRegistryAddr,
      darknodePaymentAddr,
      claimRewardsAddr,
      gatewayAddr,
      owner.address,
      POOL_BOND);
    await renPool.deployed();
    expect(await renToken.connect(owner).balanceOf(renPool.address)).to.equal(0);
  });

  it('should set the constructor args to the supplied values', async function () {
    expect(await renPool.owner()).to.equal(owner.address);
    expect(await renPool.nodeOperator()).to.equal(nodeOperator.address);
    expect(await renPool.bond()).to.equal(POOL_BOND);
    expect(await renPool.isLocked()).to.equal(false);
    expect(await renPool.totalPooled()).to.equal(0);
  });

  it('should deposit REN into RenPool', async function () {
    const amount = 1;

    const initBalance = await renToken.connect(alice).balanceOf(alice.address);

    await renToken.connect(alice).approve(renPool.address, amount);
    await renPool.connect(alice).deposit(amount);

    expect(await renToken.connect(owner).balanceOf(renPool.address)).to.equal(amount);
    expect(await renToken.connect(owner).balanceOf(alice.address)).to.equal(initBalance.sub(amount));
    expect(await renPool.balanceOf(alice.address)).to.equal(amount);
    expect(await renPool.totalPooled()).to.equal(amount);
  });

  it('should lock the pool after a deposit of `POOL_BOND`', async function () {
    await renToken.connect(alice).approve(renPool.address, POOL_BOND);
    await renPool.connect(alice).deposit(POOL_BOND);

    expect(await renPool.isLocked()).to.be.true;
  });

});
