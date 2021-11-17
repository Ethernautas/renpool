const { network: { config: { chainId, build, darknodePaymentAddr } } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
const DarknodePayment = require(`@renproject/sol/build/${build}/DarknodePayment.json`);

describe('RenProject/DarknodePayment contract check', () => {

  it(`should ensure compiled contract networks include chain ID ${chainId}`, async () => {
    expect(Object.keys(DarknodePayment.networks)).to.include(chainId.toString());
  });

  it(`should ensure compiled contract address is ${darknodePaymentAddr}`, async () => {
    expect(DarknodePayment.networks[chainId].address).to.equalIgnoreCase(darknodePaymentAddr);
  });

  it(`should ensure a DarknodePayment contract is deployed at ${darknodePaymentAddr}`, async () => {
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(darknodePaymentAddr, DarknodePayment.abi, signer);
    await contract.VERSION();
    await contract.currentCycle();
  });

});
