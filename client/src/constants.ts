import { BigNumber } from '@ethersproject/bignumber'

export const NETWORK_CONTEXT_NAME = 'NETWORK'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const DECIMALS = 18

export const TENS = BigNumber.from(10).pow(DECIMALS)

export const BOND = BigNumber.from(100_000)
  .mul(TENS)
  .toString()

export const MAX_UINT256 = BigNumber.from(2)
  .pow(256)
  .sub(1)
  .toString()

export const NETWORKS = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan',
  1337: 'Localhost 8545',
}

export const SUPPORTED_CHAIN_IDS = Object.keys(NETWORKS).map(key => parseInt(key, 10))

export enum CONTRACT_NAMES {
  RenToken = 'RenToken',
  RenPool = 'RenPool',
}

export const FAUCETS = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'https://faucet.rinkeby.io',
  5: 'Goerli',
  42: 'https://support.mycrypto.com/how-to/getting-started/where-to-get-testnet-ether',
  1337: 'https://faucet.rinkeby.io',
}

export const FAUCET_AMOUNT = 1000

export const ETHERSCAN = {
  1: 'https://etherscan.io/address/',
  3: 'https://ropsten.etherscan.io/address/',
  4: 'https://rinkeby.etherscan.io/address/',
  5: 'https://goerli.etherscan.io/address/',
  42: 'https://kovan.etherscan.io/address/',
  1337: 'https://etherscan.io/address/',
}
