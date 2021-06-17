import Web3 from 'web3'
import './types'
import { getEthereum } from './getEthereum'

const HTTP_PROVIDER = 'http://127.0.0.1:8545'

export const getWeb3 = async (): Promise<any> => {
  const ethereum = await getEthereum()
  let web3

  if (ethereum) {
    web3 = new Web3(ethereum)
  } else if (window.web3) {
    web3 = window.web3
  } else {
    const provider = new Web3.providers.HttpProvider(HTTP_PROVIDER)
    web3 = new Web3(provider)
  }

  return web3
}
