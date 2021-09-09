import { useActiveWeb3React } from './useActiveWeb3React'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export interface Api {
  isAccountLocked: boolean
  isWrongChain: boolean
}

export const useConnection = (): Api => {
  const { chainId, account } = useActiveWeb3React()

  return {
    isAccountLocked: account == null,
    isWrongChain: chainId != parseInt(CHAIN_ID, 10),
  }
}
