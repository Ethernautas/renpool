const { ethers: { BigNumber: { from: bn } } } = require('hardhat');
const { expect } = require('chai');

describe('RenPool contract `receive` test', function () {

  async function deploy() {
    const signers = await ethers.getSigners();
    const RenPool = await ethers.getContractFactory('RenPool');
    const renPool = await RenPool.deploy(
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      signers[0].address,
      0);
    await renPool.deployed();
    return [renPool, ...await ethers.getSigners()]
  }

  it('should receive ETH and emit `EthDeposited` event', async function () {
    const [renPool, owner, alice, bob] = await deploy();

    await owner.sendTransaction({ to: renPool.address, value: 1000 });
    expect(await ethers.provider.getBalance(renPool.address)).to.be.equal(bn(1000));

    await alice.sendTransaction({ to: renPool.address, value: 2000 });
    expect(await ethers.provider.getBalance(renPool.address)).to.be.equal(bn(3000));

    await bob.sendTransaction({ to: renPool.address, value: 3000 });
    expect(await ethers.provider.getBalance(renPool.address)).to.be.equal(bn(6000));

    const EthDeposited = renPool.filters.EthDeposited(null, null);
    const events = await renPool.queryFilter(EthDeposited);

    const check = (index, signer, amount) => {
      const event = events[index];
      expect(event.eventSignature).to.be.equal('EthDeposited(address,uint256)');
      expect(event.args._from).to.be.equal(signer.address);
      expect(event.args._amount).to.be.equal(bn(amount));
    };

    check(0, owner, 1000);
    check(1, alice, 2000);
    check(2, bob, 3000);
  });

});
