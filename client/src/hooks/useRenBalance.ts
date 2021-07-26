import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { CONTRACT_NAMES } from '../constants'
import { useContract } from './useContract'

// Try to move this to useRenToken
export const useRenBalance = (account?: string): BigNumber => {
  const { library } = useWeb3React<Web3Provider>() // MetaMask / injected

  const renToken = useContract(CONTRACT_NAMES.RenToken)

  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))

  useEffect(() => {
    if (library == null || renToken == null || account == null) return

    const query = async () => {
      const _balance: BigNumber = await renToken.balanceOf(account, { gasLimit: 60000 })
      setBalance(_balance)
    }

    query()

    // Listen for changes on an Ethereum address
    console.log('listening for Transfer...')
    const fromMe = renToken.filters.Transfer(account, null)
    library.on(fromMe, (from, to, amount, event) => {
      console.log('Transfer|sent', { from, to, amount, event })
      query()
    })

    const toMe = renToken.filters.Transfer(null, account)
    library.on(toMe, (from, to, amount, event) => {
      console.log('Transfer|received', { from, to, amount, event })
      query()
    })

    // Remove listener when the component is unmounted
    return () => {
      library.removeAllListeners(toMe)
      library.removeAllListeners(fromMe)
    }
  }, [library, renToken, account])

  return balance
}
