import React from 'react'
import { useWeb3React } from '@web3-react/core'

export const Account = (): JSX.Element => {
  const { account } = useWeb3React() // MetaMask / injected

  return (
    <>
      <span>Account</span>
      <span role="img" aria-label="robot">
        🤖
      </span>
      <span>
        {account === null
          ? '-'
          : account
            ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
            : ''}
      </span>
    </>
  )
}
