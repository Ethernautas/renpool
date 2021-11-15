const {
  ethers: {
    utils: { base58 },
    BigNumber: { from: bn }
  },
  network: {
    config: {
      renTokenAddr,
      renBTC,
      topRenTokenHolder,
      darknodeRegistryAddr,
      darknodePaymentAddr
    },
    provider
  } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));

const RenToken = require('@renproject/sol/build/testnet/RenToken.json');
const DarknodeRegistryLogicV1 = require('@renproject/sol/build/testnet/DarknodeRegistryLogicV1.json');
const DarknodeRegistryProxy = require('@renproject/sol/build/testnet/DarknodeRegistryProxy.json');
const DarknodePayment = require('@renproject/sol/build/testnet/DarknodePayment.json');
const { config } = require('dotenv');

describe('RenPool contract test', function () {

  const DECIMALS = 18;
  const DIGITS = bn(10).pow(DECIMALS);
  const POOL_BOND = bn(100_000).mul(DIGITS);

  const claimRewardsAddr = renTokenAddr;
  const gatewayAddr = renTokenAddr;

  const renToken = new ethers.Contract(renTokenAddr, RenToken.abi);
  const darknodeRegistry = new ethers.Contract(darknodeRegistryAddr, DarknodeRegistryLogicV1.abi);
  const darknodePayment = new ethers.Contract(darknodePaymentAddr, DarknodePayment.abi);

  let owner, nodeOperator, alice, bob;
  let renPool;

  before(async () => {
    [owner, nodeOperator, alice, bob] = await ethers.getSigners();

    expect(await renToken.connect(owner).balanceOf(topRenTokenHolder)).to.be.above(0);
    await provider.request({ method: 'hardhat_impersonateAccount', params: [topRenTokenHolder] });

    const signer = await ethers.getSigner(topRenTokenHolder);
    for (const user of (await ethers.getSigners()).slice(2)) {
      expect(await renToken.connect(owner).balanceOf(user.address)).to.equal(0);

      const amount = POOL_BOND.mul(5);
      await renToken.connect(signer).transfer(user.address, amount);
      expect(await renToken.connect(owner).balanceOf(user.address)).to.equal(amount);
    }

    await provider.request({ method: 'hardhat_stopImpersonatingAccount', params: [topRenTokenHolder] });
  });

  beforeEach(async () => {
    renPool = await (await ethers.getContractFactory('RenPool')).connect(nodeOperator).deploy(
      renToken.address,
      darknodeRegistry.address,
      darknodePayment.address,
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

  describe('deposit', function () {

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

    it('should fail when deposit without approval', async function () {
      const amount = 1;
      await expect(
        //TODO: This should throw 'Deposit failed', not sure why not (?)
        renPool.connect(alice).deposit(amount)
      ).to.be.reverted;
    });

    it('should fail when deposit is 0', async function () {
      await renToken.connect(alice).approve(renPool.address, POOL_BOND);

      await expect(
        renPool.connect(alice).deposit(0)
      ).to.be.revertedWith('RenPool: Invalid amount');
    });

    it('should fail when deposit surpasses bond', async function () {
      const amount = POOL_BOND.mul(2);
      await renToken.connect(alice).approve(renPool.address, amount);

      await expect(
        renPool.connect(alice).deposit(amount)
      ).to.be.revertedWith('RenPool: Amount surpasses bond');
    });

    it('should fail when deposit after locking', async function () {
      await renToken.connect(alice).approve(renPool.address, POOL_BOND);
      await renPool.connect(alice).deposit(POOL_BOND);

      expect(await renPool.isLocked()).to.be.true;
      const amount = 1;
      await expect(
        renPool.connect(alice).deposit(amount)
      ).to.be.revertedWith('RenPool: Pool is locked');
    });

    it('should fail when deposit after unlocking', async function () {
      await renToken.connect(alice).approve(renPool.address, POOL_BOND);
      await renPool.connect(alice).deposit(POOL_BOND);

      expect(await renPool.isLocked()).to.be.true;

      await renPool.connect(nodeOperator).unlockPool();
      expect(await renPool.isLocked()).to.be.false;

      const amount = 1;
      await renToken.connect(alice).approve(renPool.address, amount);
      await expect(
        renPool.connect(alice).deposit(amount)
      ).to.be.revertedWith('RenPool: Amount surpasses bond');
    });

  });

  describe('withdraw/fulfillWithdrawRequest', function () {

    it('should withdraw properly', async function () {
      const amount = 1;

      const balance = await renToken.connect(alice).balanceOf(alice.address);

      await renToken.connect(alice).approve(renPool.address, amount);
      await renPool.connect(alice).deposit(amount);

      await renPool.connect(alice).withdraw(amount);

      expect(await renToken.connect(owner).balanceOf(renPool.address)).to.equal(0);
      expect(await renToken.connect(owner).balanceOf(alice.address)).to.equal(balance);
      expect(await renPool.balanceOf(alice.address)).to.equal(0);
      expect(await renPool.totalPooled()).to.equal(0);
    });

    it('should withdraw after unlocking', async function () {
      const balance = await renToken.connect(alice).balanceOf(alice.address);

      await renToken.connect(alice).approve(renPool.address, POOL_BOND);
      await renPool.connect(alice).deposit(POOL_BOND);
      expect(await renPool.isLocked()).to.be.true;

      await renPool.connect(nodeOperator).unlockPool();
      expect(await renPool.isLocked()).to.be.false;

      await renPool.connect(alice).withdraw(POOL_BOND);

      expect(await renToken.connect(owner).balanceOf(renPool.address)).to.equal(0);
      expect(await renToken.connect(owner).balanceOf(alice.address)).to.equal(balance);
      expect(await renPool.balanceOf(alice.address)).to.equal(0);
      expect(await renPool.totalPooled()).to.equal(0);
    });

    it('should fulfill withdraw properly', async function () {
      const amount = 1;

      const aliceBalance = await renToken.connect(alice).balanceOf(alice.address);
      const bobBalance = await renToken.connect(bob).balanceOf(bob.address);

      await renToken.connect(bob).approve(renPool.address, POOL_BOND);
      await renPool.connect(bob).deposit(POOL_BOND);

      expect(await renPool.isLocked()).to.be.true;

      await renPool.connect(bob).requestWithdraw(amount);
      expect(await renPool.withdrawRequests(bob.address)).to.equal(amount);

      await renToken.connect(alice).approve(renPool.address, POOL_BOND);
      await renPool.connect(alice).fulfillWithdrawRequest(bob.address);

      expect(await renToken.connect(owner).balanceOf(renPool.address)).to.equal(POOL_BOND);
      expect(await renToken.connect(alice).balanceOf(alice.address)).to.equal(aliceBalance.sub(amount));
      // expect(await renToken.connect(bob).balanceOf(bob.address)).to.equal(bobBalance);
      expect(await renPool.balanceOf(alice.address)).to.equal(amount);
      // expect(await renPool.balanceOf(bob.address)).to.equal(0);
      expect(await renPool.isLocked()).to.be.true;
      expect(await renPool.totalPooled()).to.equal(POOL_BOND);
    });

    // TODO: Test remaining paths
    // TODO: Test case when 'uint senderBalance = balances[sender];' is undefined for the given sender

  });

  describe('registerDarknode', function () {

    function base58ToHex(textData) {
      return '0x' + Buffer.from(base58.decode(textData)).toString('hex').slice(4);
    }

    it('should convert base58 to hex', function () {
      expect(base58ToHex('8MHJ9prQt7UGupfZKSMVes3VzPrGBB'))
        .to.equalIgnoreCase('0x597869E66F904F741Bf16788F1FCAe36E603F112');
    });

    const NODE_ID = base58ToHex('8MHJ9prQt7UGupfZKSMVes3VzPrGBB');
    const PUBLIC_KEY = '0x000000077373682d727361000000030100010000010100d0feba4ae65ea9ad771d153419bcc21189d954b6bf75fd5488055cd2641231014f190c0e059a452d301c535e931df33590ec0e18c59341a2766cc885d1dc6e66f5cc65b94522ec944ae4200bd56a30223328b258d50b507dd94b4c4742768f3fec2b815c9c4b0fe26727e82865f6a064fa3ff2443d135d9788095a1c17487fd5c389a491c16b73385d516a303debc3bcccae337a7ec0d89d51ce05262a0c4c1f2178466c85379b8cd4e5cbe1c90a05fb0c1ed3eee2134774b450e7b0b70c792abad55beef919e21a03cb9de4e963a820c2f84421a4559d0b67cfd17c1686ff6f2d1bb07ac2c82cede1cf5f16a57e125a29fef65891715b061606bca1a0eb026b';

    it('should transfer reward to darknode owner', async function () {
      await renToken.connect(bob).approve(renPool.address, POOL_BOND);
      await renPool.connect(bob).deposit(POOL_BOND);

      await renPool.connect(nodeOperator).approveBondTransfer();
      await renPool.connect(nodeOperator).registerDarknode(NODE_ID, PUBLIC_KEY);

      // TODO: set up chain.mine(timedelta=C.ONE_MONTH)
      await darknodeRegistry.connect(alice).epoch();

      expect(await darknodeRegistry.connect(alice).isRegistered(NODE_ID)).to.be.true;

      // TODO: set up chain.mine(timedelta=C.ONE_MONTH)
      await darknodeRegistry.connect(alice).epoch();

      await renPool.transferRewardsToDarknodeOwner([renBTC]);
    });

  });

});
