import { useState, useEffect } from 'react'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { injected } from '../connectors'
import { useActiveWeb3React } from './useActiveWeb3React'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export const useContract = (
  address: string,
  abi: ContractInterface,
): Contract | null => {
  const { connector, library, chainId, account } = useActiveWeb3React()

  const [contract, setContract] = useState<Contract>()

  useEffect(() => {
    const load = (): Contract => (
      new Contract(
        address,
        abi,
        connector === injected ? library.getSigner(account) : library,
      )
    )

    if (chainId === parseInt(CHAIN_ID, 10)) {
      setContract(load())
    }
  }, [connector, chainId])

  return contract
}
