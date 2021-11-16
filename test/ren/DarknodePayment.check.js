const { network: { config: { chainId, darknodePaymentAddr } } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
const DarknodePayment = require('@renproject/sol/build/testnet/DarknodePayment.json');

describe('RenProject/DarknodePayment contract check', () => {

  it(`should include chain ID ${chainId} within contract networks`, async () => {
    expect(Object.keys(DarknodePayment.networks)).to.include(chainId.toString());
  });

  it(`should check contract address is ${darknodePaymentAddr}`, async () => {
    expect(DarknodePayment.networks[chainId].address).to.equalIgnoreCase(darknodePaymentAddr);
  });

});
