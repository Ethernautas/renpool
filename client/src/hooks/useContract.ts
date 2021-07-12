import { useState, useEffect } from 'react'
// import { Contract, Wallet } from 'ethers'
import { Contract } from 'web3-eth-contract'
import map from '../artifacts/deployments/map.json'
import { useActiveWeb3React } from './useActiveWeb3React'

const CHAIN_ID = 1337 // process.env.REACT_APP_CHAIN_ID

if (CHAIN_ID == null) {
  throw new Error('Missing env var REACT_APP_CHAIN_ID')
}

export const useContract = (contractName: 'RenToken' | 'RenPool'): Contract | null => {
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
    const load = async (): Promise<Contract> => {
      let address
      let artifact

      try {
        address = map[CHAIN_ID][contractName][0]
        // load the artifact with the specified address
        artifact = await import(`../artifacts/deployments/${chainId}/${address}.json`)
      } catch (e) {
        alert(`Could not load contract ${contractName}, ${JSON.stringify(e, null, 2)}`)
        return Promise.resolve(null)
      }

      // const wallet = library.getSigner(account)
      // const randWallet = Wallet.createRandom().connect(library)

      // instantiate contract and assign to component ref variable
      return new library.eth.Contract(artifact.abi, address)
      // return new Contract(
      //   address,
      //   artifact.abi,
      //   wallet._address != null ? wallet : randWallet,
      // )
    }

    if (chainId != null) {
      load().then((c) => { setContract(c) })
    }
  }, [connector, account, chainId])

  return contract
}




// import { useState, useEffect } from 'react'
// import { Contract, Wallet } from 'ethers'
// import map from '../artifacts/deployments/map.json'
// import { useActiveWeb3React } from './useActiveWeb3React'

// const CHAIN_ID = 1337 // process.env.REACT_APP_CHAIN_ID

// if (CHAIN_ID == null) {
//   throw new Error('Missing env var REACT_APP_CHAIN_ID')
// }

// export const useContract = (contractName: 'RenToken' | 'RenPool'): Contract | null => {
//   const { connector, library, chainId, account } = useActiveWeb3React()
//   // console.log({ library, chainId })
//   const [contract, setContract] = useState<Contract>()


//   // const [contract, setContract] = useState()
//   // const [count, setCount] = useState()

//   // function to get current count and update UI
//   // const updateCount = async () => {
//   //   const newCount = await contract.current.getCount()
//   //   setCount(newCount.toString())
//   // }

//   // function to invoke a mutating method on our contract
//   // const increment = async () => {
//   //   const tx = await contract.current.increment()
//   //   await tx.wait() // wait for mining
//   //   updateCount() // update count on UI
//   // }

//   useEffect(() => {
//     const load = async (): Promise<Contract | null> => {
//       let address
//       let artifact

//       try {
//         address = map[CHAIN_ID][contractName][0]
//         // load the artifact with the specified address
//         artifact = await import(`../artifacts/deployments/${chainId}/${address}.json`)
//       } catch (e) {
//         alert(`Could not load contract ${contractName}, ${JSON.stringify(e, null, 2)}`)
//         return Promise.resolve(null)
//       }

//       const wallet = library.getSigner(account)
//       const randWallet = Wallet.createRandom().connect(library)

//       // instantiate contract and assign to component ref variable
//       return new Contract(
//         address,
//         artifact.abi,
//         wallet._address != null ? wallet : randWallet,
//       )
//     }

//     if (chainId != null) {
//       load().then((c) => { setContract(c) })
//     }
//   }, [connector, account, chainId])

//   return contract
// }

