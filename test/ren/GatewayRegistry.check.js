// const RenToken = artifacts.require("RenToken");
// const DarknodePayment = artifacts.require("DarknodePayment");
// const DarknodePaymentStore = artifacts.require("DarknodePaymentStore");
// const ClaimlessRewards = artifacts.require("ClaimlessRewards");
// const DarknodeRegistryStore = artifacts.require("DarknodeRegistryStore");
// const DarknodeRegistryProxy = artifacts.require("DarknodeRegistryProxy");
// const DarknodeRegistryLogicV1 = artifacts.require("DarknodeRegistryLogicV1");
// const DarknodeSlasher = artifacts.require("DarknodeSlasher");
// const Protocol = artifacts.require("Protocol");
// const ClaimRewards = artifacts.require("ClaimRewards");
// const GetOperatorDarknodes = artifacts.require("GetOperatorDarknodes");
// const RenProxyAdmin = artifacts.require("RenProxyAdmin");
// const { network: { config: { chainId, build, darknodeRegistryAddr } } } = require('hardhat');
// const { expect } = require('chai').use(require('chai-string'));
// const GatewayRegistryLogicV1 = require(`@renproject/sol/build/${build}/GatewayRegistryLogicV1.json`);
// const GatewayRegistryProxy = require(`@renproject/sol/build/${build}/GatewayRegistryProxy.json`);

// describe('RenProject/GatewayRegistry contracts check', function () {

//   it(`should ensure compiled contract networks include chain ID ${chainId}`, async () => {
//     expect(Object.keys(GatewayRegistryLogicV1.networks)).to.include(chainId.toString());
//     expect(Object.keys(GatewayRegistryProxy.networks)).to.include(chainId.toString());
//   });

//   it(`should ensure compiled contract address is ${darknodeRegistryAddr}`, async () => {
//     expect(GatewayRegistryProxy.networks[chainId].address).to.equalIgnoreCase(darknodeRegistryAddr);
//   });

//   it(`should ensure a GatewayRegistry contract is deployed at ${darknodeRegistryAddr}`, async () => {
//     const [signer] = await ethers.getSigners();
//     const contract = new ethers.Contract(darknodeRegistryAddr, GatewayRegistryLogicV1.abi, signer);
//     await contract.VERSION();
//     await contract.currentEpoch();
//   });

// });
