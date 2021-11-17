const {
  ethers: {
    getSigner,
    getSigners,
    getContractFactory,
    utils: { base58 },
    Contract,
    BigNumber: { from: bn }
  },
  network: {
    config: {
      renTokenAddr,
      renBTCAddr,
      topRenTokenHolderAddr,
      darknodeRegistryAddr,
      darknodePaymentAddr,
      darknodeRegistryStoreAddr,
      claimRewardsAddr,
      gatewayAddr,
    },
    provider
  } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
require('dotenv');
const RenToken = require('@renproject/sol/build/testnet/RenToken.json');
const DarknodeRegistryLogicV1 = require('@renproject/sol/build/testnet/DarknodeRegistryLogicV1.json');
const DarknodePayment = require('@renproject/sol/build/testnet/DarknodePayment.json');

describe('RenPool contract test', function () {

  const DECIMALS = 18;
  const DIGITS = bn(10).pow(DECIMALS);
  const POOL_BOND = bn(100_000).mul(DIGITS);

  const renToken = new Contract(renTokenAddr, RenToken.abi);
  const darknodeRegistry = new Contract(darknodeRegistryAddr, DarknodeRegistryLogicV1.abi);
  const darknodePayment = new Contract(darknodePaymentAddr, DarknodePayment.abi);

  let owner, nodeOperator, alice, bob;
  let renPool;

  let snapshotID;

  before(async () => {
    [owner, nodeOperator, alice, bob] = await getSigners();

    expect(await renToken.connect(owner).balanceOf(topRenTokenHolderAddr)).to.be.above(0);
    await provider.request({ method: 'hardhat_impersonateAccount', params: [topRenTokenHolderAddr] });

    const signer = await getSigner(topRenTokenHolderAddr);
    for (const user of (await getSigners()).slice(2)) {
      expect(await renToken.connect(owner).balanceOf(user.address)).to.equal(0);

      const amount = POOL_BOND.mul(2);
      await renToken.connect(signer).transfer(user.address, amount);
      expect(await renToken.connect(owner).balanceOf(user.address)).to.equal(amount);
    }

    await provider.request({ method: 'hardhat_stopImpersonatingAccount', params: [topRenTokenHolderAddr] });

    renPool = await (await getContractFactory('RenPool')).connect(nodeOperator).deploy(
      renToken.address,
      darknodeRegistry.address,
      darknodePayment.address,
      claimRewardsAddr,
      gatewayAddr,
      owner.address,
      POOL_BOND);
    await renPool.deployed();
    expect(await renToken.connect(owner).balanceOf(renPool.address)).to.equal(0);

    snapshotID = await provider.request({ method: 'evm_snapshot', params: [] });
  });

  afterEach(async () => {
    await provider.request({ method: 'evm_revert', params: [snapshotID] });
    snapshotID = await provider.request({ method: 'evm_snapshot', params: [] });
  });

  it('should set the constructor args to the supplied values', async function () {
    expect(await renPool.owner()).to.equal(owner.address);
    expect(await renPool.nodeOperator()).to.equal(nodeOperator.address);
    expect(await renPool.bond()).to.equal(POOL_BOND);
    expect(await renPool.isLocked()).to.equal(false);
    expect(await renPool.totalPooled()).to.equal(0);
  });

  describe('deposit', function () {

    [bn(1), POOL_BOND].forEach(amount => {
      it('should deposit REN into RenPool', async function () {
        const initBalance = await renToken.connect(alice).balanceOf(alice.address);

        await renToken.connect(alice).approve(renPool.address, amount);
        await renPool.connect(alice).deposit(amount);

        expect(await renToken.connect(owner).balanceOf(renPool.address)).to.equal(amount);
        expect(await renToken.connect(owner).balanceOf(alice.address)).to.equal(initBalance.sub(amount));
        expect(await renPool.balanceOf(alice.address)).to.equal(amount);
        expect(await renPool.totalPooled()).to.equal(amount);
      });
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

    it('should fail when deposit after unlocking while the pool is still full', async function () {
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

    [bn(1), POOL_BOND.sub(1)].forEach(amount => {
      it('should withdraw properly', async function () {
        const balance = await renToken.connect(alice).balanceOf(alice.address);

        await renToken.connect(alice).approve(renPool.address, amount);
        await renPool.connect(alice).deposit(amount);

        await renPool.connect(alice).withdraw(amount);

        expect(await renToken.connect(owner).balanceOf(renPool.address)).to.equal(0);
        expect(await renToken.connect(owner).balanceOf(alice.address)).to.equal(balance);
        expect(await renPool.balanceOf(alice.address)).to.equal(0);
        expect(await renPool.totalPooled()).to.equal(0);
      });
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
      expect(await renToken.connect(bob).balanceOf(bob.address)).to.equal(bobBalance.sub(POOL_BOND).add(amount));
      expect(await renPool.balanceOf(alice.address)).to.equal(amount);
      expect(await renPool.balanceOf(bob.address)).to.equal(POOL_BOND.sub(amount));
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

    async function increaseMonth() {
      const ONE_MONTH = 60 * 60 * 24 * 32;
      await provider.send('evm_increaseTime', [ONE_MONTH]);
    }

    const NODE_ID = base58ToHex('8MHJ9prQt7UGupfZKSMVes3VzPrGBB');
    const PUBLIC_KEY = '0x000000077373682d727361000000030100010000010100d0feba4ae65ea9ad771d153419bcc21189d954b6bf75fd5488055cd2641231014f190c0e059a452d301c535e931df33590ec0e18c59341a2766cc885d1dc6e66f5cc65b94522ec944ae4200bd56a30223328b258d50b507dd94b4c4742768f3fec2b815c9c4b0fe26727e82865f6a064fa3ff2443d135d9788095a1c17487fd5c389a491c16b73385d516a303debc3bcccae337a7ec0d89d51ce05262a0c4c1f2178466c85379b8cd4e5cbe1c90a05fb0c1ed3eee2134774b450e7b0b70c792abad55beef919e21a03cb9de4e963a820c2f84421a4559d0b67cfd17c1686ff6f2d1bb07ac2c82cede1cf5f16a57e125a29fef65891715b061606bca1a0eb026b';

    it('should register darknode', async function () {
      const balance = await renToken.connect(owner).balanceOf(darknodeRegistryStoreAddr);

      await renToken.connect(alice).approve(renPool.address, POOL_BOND);
      await renPool.connect(alice).deposit(POOL_BOND);

      await renPool.connect(nodeOperator).approveBondTransfer();
      await renPool.connect(nodeOperator).registerDarknode(NODE_ID, PUBLIC_KEY);

      expect(await renToken.connect(owner).balanceOf(darknodeRegistryStoreAddr)).to.equal(POOL_BOND.add(balance));
      expect(await renToken.connect(owner).balanceOf(renPool.address)).to.equal(0);
      expect(await darknodeRegistry.connect(owner).isPendingRegistration(NODE_ID)).to.be.true;
      expect(await darknodeRegistry.connect(owner).isRegistered(NODE_ID)).to.be.false;

      expect(await renPool.connect(owner).darknodeID()).to.equalIgnoreCase(NODE_ID);
      expect(await renPool.connect(owner).publicKey()).to.equalIgnoreCase(PUBLIC_KEY);

      await increaseMonth();
      await darknodeRegistry.connect(alice).epoch();

      expect(await darknodeRegistry.connect(owner).isPendingRegistration(NODE_ID)).to.be.false;
      expect(await darknodeRegistry.connect(owner).isRegistered(NODE_ID)).to.be.true;
      expect(await darknodeRegistry.connect(owner).getDarknodeOperator(NODE_ID)).to.equal(renPool.address);
    });

    it('should fail when darknode registration is not performed by node operator', async () => {
      expect(alice).to.not.equal(nodeOperator);

      await renToken.connect(alice).approve(renPool.address, POOL_BOND);
      await renPool.connect(alice).deposit(POOL_BOND);
      await renPool.connect(nodeOperator).approveBondTransfer();

      await expect(
        renPool.connect(alice).registerDarknode(NODE_ID, PUBLIC_KEY)
      ).to.be.revertedWith('RenPool: Caller is not node operator');
    });

    it('should fail when darknode registration is performed twice', async () => {
      await renToken.connect(alice).approve(renPool.address, POOL_BOND);
      await renPool.connect(alice).deposit(POOL_BOND);
      await renPool.connect(nodeOperator).approveBondTransfer();
      await renPool.connect(nodeOperator).registerDarknode(NODE_ID, PUBLIC_KEY)

      await expect(
        renPool.connect(nodeOperator).registerDarknode(NODE_ID, PUBLIC_KEY)
      ).to.be.revertedWith('DarknodeRegistry: must be refunded or never registered');
    });

    it('should fail when darknode registration is performed twice but preserves first registration data', async () => {
      await renToken.connect(alice).approve(renPool.address, POOL_BOND);
      await renPool.connect(alice).deposit(POOL_BOND);
      await renPool.connect(nodeOperator).approveBondTransfer();
      await renPool.connect(nodeOperator).registerDarknode(NODE_ID, PUBLIC_KEY)

      const OTHER_NODE_ID = base58ToHex('8MHJ9prQt7UGupfZKSMVes3VzPrGB1');
      const OTHER_PUBLIC_KEY = '0x000000077373682d727361000000030100010000010100d0feba4ae65ea9ad771d153419bcc21189d954b6bf75fd5488055cd2641231014f190c0e059a452d301c535e931df33590ec0e18c59341a2766cc885d1dc6e66f5cc65b94522ec944ae4200bd56a30223328b258d50b507dd94b4c4742768f3fec2b815c9c4b0fe26727e82865f6a064fa3ff2443d135d9788095a1c17487fd5c389a491c16b73385d516a303debc3bcccae337a7ec0d89d51ce05262a0c4c1f2178466c85379b8cd4e5cbe1c90a05fb0c1ed3eee2134774b450e7b0b70c792abad55beef919e21a03cb9de4e963a820c2f84421a4559d0b67cfd17c1686ff6f2d1bb07ac2c82cede1cf5f16a57e125a29fef65891715b061606bca1a0eb026c';

      await expect(
        renPool.connect(nodeOperator).registerDarknode(OTHER_NODE_ID, OTHER_PUBLIC_KEY)
      ).to.be.revertedWith('');

      expect(await renPool.connect(owner).darknodeID()).to.equalIgnoreCase(NODE_ID);
      expect(await renPool.connect(owner).publicKey()).to.equalIgnoreCase(PUBLIC_KEY);
    });

    it('should transfer reward to darknode owner', async function () {
      await renToken.connect(bob).approve(renPool.address, POOL_BOND);
      await renPool.connect(bob).deposit(POOL_BOND);

      await renPool.connect(nodeOperator).approveBondTransfer();
      await renPool.connect(nodeOperator).registerDarknode(NODE_ID, PUBLIC_KEY);

      await increaseMonth();
      await darknodeRegistry.connect(alice).epoch();

      expect(await darknodeRegistry.connect(alice).isRegistered(NODE_ID)).to.be.true;

      await increaseMonth();
      await darknodeRegistry.connect(alice).epoch();

      await renPool.transferRewardsToDarknodeOwner([renBTCAddr]);
      // ^ OBSERVATION: not sure if the above if actually working,
      // we need a way to query the darknode's balance.
      // Also, not sure if darknodePayment is still being used or has
      // been replaced by the RenVM.
    });

    it('should convert base58 to hex', function () {
      expect(base58ToHex('8MHJ9prQt7UGupfZKSMVes3VzPrGBB'))
        .to.equalIgnoreCase('0x597869E66F904F741Bf16788F1FCAe36E603F112');
    });

  });

});
