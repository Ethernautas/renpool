const { network: { config: { chainId, build, claimRewardsAddr } } } = require('hardhat');
const { expect } = require('chai').use(require('chai-string'));
const ClaimRewardsV1 = require(`@renproject/sol/build/${build}/ClaimRewardsV1.json`);
const ClaimRewardsProxy = require(`@renproject/sol/build/${build}/ClaimRewardsProxy.json`);

describe.only('RenProject/ClaimRewards contracts check', function () {

  it(`should ensure compiled contract networks include chain ID ${chainId}`, async () => {
    expect(Object.keys(ClaimRewardsV1.networks)).to.include(chainId.toString());
    expect(Object.keys(ClaimRewardsProxy.networks)).to.include(chainId.toString());
  });

  it(`should ensure compiled contract address is ${claimRewardsAddr}`, async () => {
    expect(ClaimRewardsProxy.networks[chainId].address).to.equalIgnoreCase(claimRewardsAddr);
  });

  it(`should ensure a ClaimRewards contract is deployed at ${claimRewardsAddr}`, async () => {
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(claimRewardsAddr, ClaimRewardsV1.abi, signer);
    await contract.VERSION();
    await contract.currentEpoch();
  });

});
