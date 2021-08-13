import { useState, useEffect } from 'react'
import { Contract } from '@ethersproject/contracts'
import { CONTRACT_NAMES } from '../constants'
import map from '../artifacts/deployments/map.json'
import { injected } from '../connectors'
import { useActiveWeb3React } from './useActiveWeb3React'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export const useContract = (
  contractName: CONTRACT_NAMES,
): Contract | null => {
  const { connector, library, chainId, account } = useActiveWeb3React()

  const [contract, setContract] = useState<Contract>()

  useEffect(() => {
    const load = (): Contract => {
      let address
      let artifact

      try {
        address = map[CHAIN_ID][contractName][0]
        artifact = require(`../artifacts/deployments/${CHAIN_ID}/${address}.json`)
      } catch (e) {
        alert(`Could not load contract ${contractName}, ${JSON.stringify(e, null, 2)}`)
        return null
      }

      return new Contract(
        address,
        artifact.abi,
        connector === injected ? library.getSigner(account) : library,
      )
    }

    if (chainId === parseInt(CHAIN_ID, 10)) {
      setContract(load())
    }
  }, [connector, chainId])

  return contract
}
