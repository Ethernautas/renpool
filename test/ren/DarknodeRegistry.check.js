const { network: { config: { chainId, build, darknodeRegistryAddr } } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
const DarknodeRegistryLogicV1 = require(`@renproject/sol/build/${build}/DarknodeRegistryLogicV1.json`);
const DarknodeRegistryProxy = require(`@renproject/sol/build/${build}/DarknodeRegistryProxy.json`);

describe('RenProject/DarknodeRegistry contracts check', function () {

  it(`should ensure compiled contract networks include chain ID ${chainId}`, async () => {
    expect(Object.keys(DarknodeRegistryLogicV1.networks)).to.include(chainId.toString());
    expect(Object.keys(DarknodeRegistryProxy.networks)).to.include(chainId.toString());
  });

  it(`should ensure compiled contract address is ${darknodeRegistryAddr}`, async () => {
    expect(DarknodeRegistryProxy.networks[chainId].address).to.equalIgnoreCase(darknodeRegistryAddr);
  });

  it(`should ensure a DarknodeRegistry contract is deployed at ${darknodeRegistryAddr}`, async () => {
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(darknodeRegistryAddr, DarknodeRegistryLogicV1.abi, signer);
    await contract.VERSION();
    await contract.currentEpoch();
  });

});
