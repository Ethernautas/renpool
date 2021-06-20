import { getEthereum } from './ethereum'
import { getWeb3 } from './web3'

export interface Connector {
  web3: any
  accounts: string[]
  chainId: number
}

export const getConnector = async (): Promise<Connector | null> => {
  // Get network provider and web3 instance.
  const web3 = await getWeb3()

  // Try and enable accounts (connect metamask)
  let ethereum
  try {
    ethereum = await getEthereum()
    ethereum.enable()
  } catch (e) {
    console.log(e)
    return null
  }

  // Use web3 to get the user's accounts
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
  // const accounts = await web3.eth.getAccounts()

  // Get the current chain id
  const chainId = parseInt(await web3.eth.getChainId())

  return { web3, accounts, chainId }
}
