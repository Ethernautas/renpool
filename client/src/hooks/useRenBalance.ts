import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { CONTRACT_NAMES } from '../constants'
import { useContract } from './useContract'

export const useRenBalance = (): BigNumber => {
  const { account, library } = useWeb3React<Web3Provider>()
  const renToken = useContract(CONTRACT_NAMES.RenToken)
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))

  useEffect(() => {
    if (library == null || renToken == null) return

    const load = async () => {
      const _balance: BigNumber = await renToken.balanceOf(account, { gasLimit: 60000 })
      setBalance(_balance)
    }

    load()

    // Listen for changes on an Ethereum address
    console.log('listening for Transfer...')
    const fromMe = renToken.filters.Transfer(account, null)
    library.on(fromMe, (from, to, amount, event) => {
      console.log('Transfer|sent', { from, to, amount, event })
      load()
    })
    const toMe = renToken.filters.Transfer(null, account)
    library.on(toMe, (from, to, amount, event) => {
      console.log('Transfer|received', { from, to, amount, event })
      load()
    })

    // Remove listener when the component is unmounted
    return () => {
      library.removeAllListeners(toMe)
      library.removeAllListeners(fromMe)
    }
  }, [renToken])

  return balance
}
