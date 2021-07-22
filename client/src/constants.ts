import { BigNumber } from '@ethersproject/bignumber'

export const NETWORK_CONTEXT_NAME = 'NETWORK'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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