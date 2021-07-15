import React, { useState, useEffect } from 'react'
import { formatEther } from '@ethersproject/units'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

export const Balance = (): JSX.Element => {
  const { account, library, chainId } = useActiveWeb3React()

  const [balance, setBalance] = useState(null)

  useEffect(() => {
    if (account != null && library != null) {
      let stale = false

      library
        .getBalance(account)
        .then((balance: any) => {
          if (!stale) {
            setBalance(balance)
          }
        })
        .catch(() => {
          if (!stale) {
            setBalance(null)
          }
        })

      return () => {
        stale = true
        setBalance(undefined)
      }
    }
  }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <>
      <span>Balance</span>
      <span role="img" aria-label="gold">
        💰
      </span>
      <span>{balance == null ? 'Error' : balance ? `Ξ${formatEther(balance)}` : ''}</span>
    </>
  )
}
