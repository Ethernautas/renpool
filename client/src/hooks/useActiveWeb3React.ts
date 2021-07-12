import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
// import { Web3Provider } from '@ethersproject/providers'
import Web3 from 'web3'
import { NETWORK_CONTEXT_NAME } from '../constants'

export const useActiveWeb3React = (): Web3ReactContextInterface<Web3> => {
  const context = useWeb3ReactCore<Web3>()
  const contextNetwork = useWeb3ReactCore<Web3>(NETWORK_CONTEXT_NAME)
  return context.active ? context : contextNetwork
}
