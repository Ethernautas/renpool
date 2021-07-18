import { useState, useEffect } from 'react'
import { Contract } from '@ethersproject/contracts'
import { CONTRACT_NAMES } from '../constants'
import map from '../artifacts/deployments/map.json'
import { injected } from '../connectors'
import { useActiveWeb3React } from './useActiveWeb3React'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export const useContract = (contractName: keyof typeof CONTRACT_NAMES): Contract | null => {
  const { connector, library, chainId, account } = useActiveWeb3React()
  // console.log({ library, chainId })
  const [contract, setContract] = useState<Contract>()


  // const [contract, setContract] = useState()
  // const [count, setCount] = useState()

  // function to get current count and update UI
  // const updateCount = async () => {
  //   const newCount = await contract.current.getCount()
  //   setCount(newCount.toString())
  // }

  // function to invoke a mutating method on our contract
  // const increment = async () => {
  //   const tx = await contract.current.increment()
  //   await tx.wait() // wait for mining
  //   updateCount() // update count on UI
  // }

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
