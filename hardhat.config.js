require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

const FORK = process.env.FORK !== undefined ? process.env.FORK : 'kovan';

const networks = {
  mainnet: {
    chainId: 1,
    url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
    forking: {
      blockNumber: 13611808,
    },
    build: 'mainnet',
    contracts: {
      renTokenAddr: '0x408e41876cCCDC0F92210600ef50372656052a38',
      renBTCAddr: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
      topRenTokenHolderAddr: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
      darknodeRegistryAddr: '0x2D7b6C95aFeFFa50C068D50f89C5C0014e054f0A',
      darknodeRegistryStoreAddr: '0x60Ab11FE605D2A2C3cf351824816772a131f8782',
      darknodePaymentAddr: '0x098e1708b920EFBdD7afe33Adb6a4CBa30c370B9',
      claimRewardsAddr: '0x0000000000000000000000000000000000000000',
      gatewayAddr: '0x0000000000000000000000000000000000000000',
    },
  },
  kovan: {
    chainId: 42,
    url: `https://eth-kovan.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
    forking: {
      blockNumber: 28381671,
    },
    build: 'testnet',
    contracts: {
      renTokenAddr: '0x2CD647668494c1B15743AB283A0f980d90a87394',
      renBTCAddr: '0x0A9ADD98C076448CBcFAcf5E457DA12ddbEF4A8f',
      topRenTokenHolderAddr: '0xfd974e09363f7f823ce360d2a2006733aeb3e297',
      darknodeRegistryAddr: '0x9954C9F839b31E82bc9CA98F234313112D269712',
      darknodeRegistryStoreAddr: '0x9daa16aA19e37f3de06197a8B5E638EC5e487392',
      darknodePaymentAddr: '0x023f2e94C3eb128D3bFa6317a3fF860BF93C1616',
      claimRewardsAddr: '0x7F8f7Aff44a63f61b7a120Ef2c34Ea2c4D9bD216',
      gatewayAddr: '0x0000000000000000000000000000000000000000',
    },
  }
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.7",
  networks: {
    hardhat: {
      forking: {
        url: networks[FORK].url,
        blockNumber: networks[FORK].forking.blockNumber,
      },
      chainId: networks[FORK].chainId,
      build: networks[FORK].build,
      ...networks[FORK].contracts,
    },
    kovan: {
      chainId: networks.kovan.chainId,
      url: networks.kovan.url,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      ...networks.kovan.contracts,
    },
  },
  mocha: {
    timeout: 60000
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
