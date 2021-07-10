import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'

const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID

if (INFURA_PROJECT_ID == null) {
  throw new Error('Missing env var REACT_APP_INFURA_PROJECT_ID')
}

// How this works is that in the above code we import useWeb3 from the React
// implementation of Network JS (@openzeppelin/network/react) in order to get
// a web3Context. This is a Javascript hook that will attempt to retrieve an
// injected web3 provider which, by default, is MetaMask. If no provider is injected,
// it will use the Infura URL set as web3Context. The term injected means code or
// data that comes from a user's browser and is available for the website to use.
const RPC_URLS = {
  // 1: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
  // 4: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
  42: `https://kovan.infura.io/v3/${INFURA_PROJECT_ID}`,
}

// Infura as a JSON-RPC connection to the mainnet or testnets
export const network = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: 42, // 1,
})

// MetaMask to serve as the user’s wallet and web3 provider
export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
})
