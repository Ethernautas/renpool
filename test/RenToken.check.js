const {
  ethers: { getSigners, Contract },
  network: {
    config: {
      chainId,
      renTokenAddr,
      topRenTokenHolderAddr,
      darknodeRegistryAddr,
      darknodePaymentAddr
    }
  } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
const RenToken = require('@renproject/sol/build/testnet/RenToken.json');
const DarknodeRegistryLogicV1 = require('@renproject/sol/build/testnet/DarknodeRegistryLogicV1.json');
const DarknodeRegistryProxy = require('@renproject/sol/build/testnet/DarknodeRegistryProxy.json');
const DarknodePayment = require('@renproject/sol/build/testnet/DarknodePayment.json');

describe('RenProject contracts check', function () {

  describe('RenToken', function () {

    let renToken;

    before(async () => {
      const [owner] = await getSigners();
      renToken = new Contract(renTokenAddr, RenToken.abi, owner);
    });

    it(`should include chain ID ${chainId} within contract networks`, async () => {
      expect(Object.keys(RenToken.networks)).to.include(chainId.toString());
    });

    it(`should check contract address is ${renTokenAddr}`, async () => {
      expect(RenToken.networks[chainId].address).to.equalIgnoreCase(renTokenAddr);
    });

    it(`should check the address ${renTokenAddr} is an ERC20 RenToken contract`, async function () {
      expect(await renToken.name()).to.equal('Republic Token');
      expect(await renToken.symbol()).to.equal('REN');
    });

    it(`should check the top holder account ${topRenTokenHolderAddr} has enough REN tokens`, async () => {
      expect(await renToken.balanceOf(topRenTokenHolderAddr)).to.be.above(0);
    });

  });

  describe('DarknodeRegistry', function () {

    it(`should include chain ID ${chainId} within contract networks`, async () => {
      expect(Object.keys(DarknodeRegistryLogicV1.networks)).to.include(chainId.toString());
      expect(Object.keys(DarknodeRegistryProxy.networks)).to.include(chainId.toString());
    });

    it(`should check contract address is ${darknodeRegistryAddr}`, async () => {
      expect(DarknodeRegistryProxy.networks[chainId].address).to.equalIgnoreCase(darknodeRegistryAddr);
    });

  });

  describe('DarknodePayment', function () {

    it(`should include chain ID ${chainId} within contract networks`, async () => {
      expect(Object.keys(DarknodePayment.networks)).to.include(chainId.toString());
    });

    it(`should check contract address is ${darknodePaymentAddr}`, async () => {
      expect(DarknodePayment.networks[chainId].address).to.equalIgnoreCase(darknodePaymentAddr);
    });

  });

});