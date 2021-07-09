import { useState, useRef, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import artifact from '../artifacts/deployments/map.json'

const CHAIN_ID = 42

interface IExtContract extends ethers.Contract {
  _addr?: string
}

export const useContract = (contractName: 'RenToken' | 'RenPool'): Promise<IExtContract> => {
  const { library, chainId } = useWeb3React<ethers.providers.Web3Provider>()

  let address: string
  try {
    // contractAddress = artifact[chainId][CONTRACT_NAME][0]
    address = artifact[CHAIN_ID][contractName][0]
  } catch (e) {
    console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chainId}".`,)
    return null
  }

  const contract = useRef<ethers.Contract>()
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
    // this is only run once on component mounting
    const load = async (): Promise<void> => {
      //       const provider = new ethers.providers.JsonRpcProvider()
      //       const network = await library.getNetwork()

      // Load the artifact with the specified address
      let abi
      try {
        abi = await import(`./artifacts/deployments/${chainId}/${address}.json`)
      } catch (e) {
        console.log(`Failed to load contract artifact "./artifacts/deployments/${chainId}/${address}.json"`,)
        return null
      }

      // instantiate contract instance and assign to component ref variable
      contract.current = new ethers.Contract(
        address,
        abi,
        library.getSigner(),
      )

      // update count on UI
      // updateCount()
    }
    load()
  }, [library])

  return { ...contract.current, _addr: address }
}
