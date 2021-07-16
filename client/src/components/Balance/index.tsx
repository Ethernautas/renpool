// import React, { useState, useEffect } from 'react'
// import { useWeb3React } from '@web3-react/core'
// import { formatEther } from '@ethersproject/units'

// export const Balance = (): JSX.Element => {
//   const { chainId, library, account } = useWeb3React() // MetaMask / injected

//   const [balance, setBalance] = useState(null)

//   useEffect(() => {
//     if (account != null && library != null) {
//       let stale = false

//       library
//         .getBalance(account)
//         .then((balance: any) => {
//           if (!stale) {
//             setBalance(balance)
//           }
//         })
//         .catch(() => {
//           if (!stale) {
//             setBalance(null)
//           }
//         })

//       return () => {
//         stale = true
//         setBalance(undefined)
//       }
//     }
//   }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

//   return (
//     <>
//       <span>Balance</span>
//       <span role="img" aria-label="gold">
//         💰
//       </span>
//       <span>{balance == null ? 'Error' : balance ? `Ξ${formatEther(balance)}` : ''}</span>
//     </>
//   )
// }

import {useWeb3React} from '@web3-react/core'
import {Web3Provider} from '@ethersproject/providers'
import React, {useEffect, useState} from 'react'
import {formatUnits} from '@ethersproject/units'
import { useContract } from '../../hooks/useContract'
import { CONTRACT_NAMES } from '../../constants'
import { BigNumber } from '@ethersproject/bignumber'

const DECIMALS = 18

export const Balance = (): JSX.Element => {
  const {account, library} = useWeb3React<Web3Provider>()
  const renToken = useContract(CONTRACT_NAMES.RenToken)

  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))

  useEffect(() => {
    if (renToken == null) return

    const load = async () => {
      const _balance: BigNumber = await renToken.balanceOf(account, { gasLimit: 60000 })
      setBalance(_balance)
    }

    load()

    // listen for changes on an Ethereum address
    console.log('listening for Transfer...')
    // const contract = new Contract(address, ERC20ABI, library.getSigner())
    const fromMe = renToken.filters.Transfer(account, null)
    library.on(fromMe, (from, to, amount, event) => {
      console.log('Transfer|sent', {from, to, amount, event})
      // mutate(undefined, true)
      load()
    })
    const toMe = renToken.filters.Transfer(null, account)
    library.on(toMe, (from, to, amount, event) => {
      console.log('Transfer|received', {from, to, amount, event})
      // mutate(undefined, true)
      load()
    })
    // remove listener when the component is unmounted
    return () => {
      library.removeAllListeners(toMe)
      library.removeAllListeners(fromMe)
    }
    // trigger the effect only on component mount
  }, [renToken])

  if (!balance) {
    return <div>...</div>
  }
  return (
    <div>
      REN Balance: {parseFloat(formatUnits(balance, DECIMALS)).toPrecision(4)} {renToken?.symbol}
    </div>
  )
}
