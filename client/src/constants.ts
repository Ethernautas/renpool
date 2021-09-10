import { BigNumber } from '@ethersproject/bignumber'

export const NETWORK_CONTEXT_NAME = 'NETWORK'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const DECIMALS = 18

export const TENS = BigNumber.from(10).pow(DECIMALS)

export const BOND = BigNumber.from(100_000).mul(TENS)

export const MAX_UINT256 = BigNumber.from(2).pow(256).sub(1)

export const NETWORKS = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan',
  1337: 'Localhost 8545',
}

export const SUPPORTED_CHAIN_IDS = Object.keys(NETWORKS).map(key => parseInt(key, 10))

export enum ContractNames {
  RenPool = 'RenPool',
  RenToken = 'RenToken',
  // ^ Implementation of the Ren Token used when network === '1337'.
  // In live networks we use the IERC20 interface.
  // See /context/RenTokenProvider.tsx
}

export const FAUCETS = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'https://faucet.rinkeby.io',
  5: 'Goerli',
  42: 'https://support.mycrypto.com/how-to/getting-started/where-to-get-testnet-ether',
  1337: 'https://faucet.rinkeby.io',
}

export const FAUCET_AMOUNT = BigNumber.from(1000).mul(TENS)

export const ETHERSCAN = {
  1: 'https://etherscan.io/address/',
  3: 'https://ropsten.etherscan.io/address/',
  4: 'https://rinkeby.etherscan.io/address/',
  5: 'https://goerli.etherscan.io/address/',
  42: 'https://kovan.etherscan.io/address/',
  1337: 'https://etherscan.io/address/',
}

// Smart contract addresses for live networks only
export const CONTRACT_ADDRESSES = {
  1: {
    REN_TOKEN: '0x408e41876cCCDC0F92210600ef50372656052a38',
    DARKNODE_REGISTRY: '0x2D7b6C95aFeFFa50C068D50f89C5C0014e054f0A',
  },
  42: {
    REN_TOKEN: '0x2CD647668494c1B15743AB283A0f980d90a87394',
    DARKNODE_REGISTRY: '0x9954C9F839b31E82bc9CA98F234313112D269712',
  },
}
