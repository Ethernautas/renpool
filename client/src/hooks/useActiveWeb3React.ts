import { useWeb3React } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { Web3Provider } from '@ethersproject/providers'
import { NETWORK_CONTEXT_NAME } from '../constants'

export const useActiveWeb3React = (): Web3ReactContextInterface<Web3Provider> => {
  const context = useWeb3React<Web3Provider>()
  const contextNetwork = useWeb3React<Web3Provider>(NETWORK_CONTEXT_NAME)
  return context.active ? context : contextNetwork
}
