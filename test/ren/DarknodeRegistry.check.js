const { network: { config: { chainId, darknodeRegistryAddr } } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
const DarknodeRegistryLogicV1 = require('@renproject/sol/build/testnet/DarknodeRegistryLogicV1.json');
const DarknodeRegistryProxy = require('@renproject/sol/build/testnet/DarknodeRegistryProxy.json');

describe('RenProject/DarknodeRegistry contracts check', function () {

  it(`should include chain ID ${chainId} within contract networks`, async () => {
    expect(Object.keys(DarknodeRegistryLogicV1.networks)).to.include(chainId.toString());
    expect(Object.keys(DarknodeRegistryProxy.networks)).to.include(chainId.toString());
  });

  it(`should check contract address is ${darknodeRegistryAddr}`, async () => {
    expect(DarknodeRegistryProxy.networks[chainId].address).to.equalIgnoreCase(darknodeRegistryAddr);
  });

});
