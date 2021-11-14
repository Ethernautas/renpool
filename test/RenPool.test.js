const { expect } = require('chai');
const { ethers } = require('hardhat');
const bn = ethers.BigNumber.from;

const DECIMALS = 18;
const DIGITS = bn(10).pow(DECIMALS);
const POOL_BOND = bn(100_000).mul(DIGITS);

const ADDR='0x2CD647668494c1B15743AB283A0f980d90a87394';

describe('RenPool contract', function () {

  const renTokenAddr = ADDR;
  const darknodeRegistryAddr = ADDR;
  const darknodePaymentAddr = ADDR;
  const claimRewardsAddr = ADDR;
  const gatewayAddr = ADDR;
  // const owner = ADDR;


  it('should set the constructor args to the supplied values', async function () { 
  const [nodeOperator, owner] = await ethers.getSigners();

    const RenPool = await ethers.getContractFactory('RenPool');
    const renpool = await RenPool.connect(nodeOperator).deploy(
      renTokenAddr,
      darknodeRegistryAddr,
      darknodePaymentAddr,
      claimRewardsAddr,
      gatewayAddr,
      owner.address,
      POOL_BOND);
    await renpool.deployed();

    expect(await renpool.owner()).to.equal(owner.address);
    expect(await renpool.nodeOperator()).to.equal(nodeOperator.address);
    expect(await renpool.bond()).to.equal(POOL_BOND);
    expect(await renpool.isLocked()).to.equal(false);
    expect(await renpool.totalPooled()).to.equal(0);

    // wait until the transaction is mined
    // await (await renpool.setGreeting("Hola, mundo!")).wait();

    // expect(await renpool.greet()).to.equal("Hola, mundo!");
  });
});
