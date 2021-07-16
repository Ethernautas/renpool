import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { SUPPORTED_CHAIN_IDS } from './constants'

const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID
const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

/**
 * We use two connectors to interact with the Ethereum blockchain. The first one is
 * what it's called an injected web3 provider which, by default, is MetaMask. In
 * case the user doesn't have MetaMask installed, we'll fallback to the Infura URL
 * as the connector. The term injected means code or data that comes from a user's
 * browser and is available for the website to use. By using Infura we can perform
 * calls to the Ethereum blockchain (for instance getting some public variable's
 * value) but we cannot sign any transactions.
 */
const RPC_URLS = {
  1: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
  4: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
  42: `https://kovan.infura.io/v3/${INFURA_PROJECT_ID}`,
  1337: 'http://127.0.0.1:8545',
}

// Infura as a JSON-RPC connection to the mainnet or testnets
export const network = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: parseInt(CHAIN_ID, 10),
})

// MetaMask to serve as the user’s wallet and web3 provider
export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
})
