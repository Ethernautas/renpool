require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

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
        url: `https://eth-kovan.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
        blockNumber: 28381671,
      },
      chainId: 42,
      renTokenAddr: '0x2CD647668494c1B15743AB283A0f980d90a87394',
      topRenTokenHolder: '0xfd974e09363f7f823ce360d2a2006733aeb3e297',
    },
    mainnet: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        blockNumber: 13611808,
      },
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      renTokenAddr: '0x2CD647668494c1B15743AB283A0f980d90a87394',
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
      renTokenAddr: '0x2CD647668494c1B15743AB283A0f980d90a87394',
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
