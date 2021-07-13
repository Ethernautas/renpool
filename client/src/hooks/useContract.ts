import { useState, useEffect } from 'react'
import { Contract } from 'web3-eth-contract'
import { CONTRACT_NAMES } from '../constants'
import map from '../artifacts/deployments/map.json'
import { useActiveWeb3React } from './useActiveWeb3React'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export const useContract = (contractName: 'RenToken' | 'RenPool'): Contract | null => {
  const { connector, library, chainId } = useActiveWeb3React()
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
    const load = async (): Promise<Contract> => {
      let address
      let artifact

      try {
        address = map[CHAIN_ID][contractName][0]
        artifact = await import(`../artifacts/deployments/${CHAIN_ID}/${address}.json`)
      } catch (e) {
        alert(`Could not load contract ${contractName}, ${JSON.stringify(e, null, 2)}`)
        return Promise.resolve(null)
      }

      return new library.eth.Contract(artifact.abi, address)
    }

    if (chainId === parseInt(CHAIN_ID, 10)) {
      load().then((c) => { setContract(c) })
    }
  }, [connector, chainId])

  return contract
}
