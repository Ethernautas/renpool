import { useState, useRef, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import artifact from '../artifacts/deployments/map.json'
import { useActiveWeb3React } from './useActiveWeb3React'


const CHAIN_ID = 42

// export type IExtContract = ethers.Contract & {
//   _addr: string
// }
// export interface IExtContract extends ethers.Contract {
//   _addr: string
// }

export const useContract = (contractName: 'RenToken' | 'RenPool'): ethers.Contract | null => {
  const { library, chainId } = useActiveWeb3React()
  // const contract = useRef<ethers.Contract>(null)
  // console.log({ library, chainId })
  const [contract, setContract] = useState<ethers.Contract>()


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
    const load = async (): Promise<ethers.Contract> => {
      const address = artifact[CHAIN_ID][contractName][0]
      // console.log({address})

      // load the artifact with the specified address
      const abi = await import(`../artifacts/deployments/${chainId}/${address}.json`)
      // console.log({abi})

      const randomSigner = ethers.Wallet.createRandom().connect(library)
      console.log('RANDOM SIGNER', randomSigner, 'SIGNER', library.getSigner())

      // instantiate contract and assign to component ref variable
      return new ethers.Contract(
        address,
        abi.abi,
        // library?.getSigner() || ethers.Wallet.createRandom().connect(library),
        // library.getSigner()  || ,
        library.getSigner()._address != null ? library.getSigner() : ethers.Wallet.createRandom().connect(library),
      )
      // setContract({
      //   ...(new ethers.Contract(
      //     address,
      //     abi,
      //     library.getSigner(),
      //   )),
      //   _addr: address,
      // })
    }

    if (chainId != null) {
      // load().then((c) => { contract.current = c; console.log({ contract: c }) })
      load().then((c) => { setContract(c); console.log({ contract: c }) })
    }
  }, [chainId])

  // return contract.current
  return contract
}
