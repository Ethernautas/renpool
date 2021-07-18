import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { ChainId } from '../ChainId'
import { Account } from '../Account'

export const Header = (): JSX.Element => {
  const { active, error } = useWeb3React()

  return (
    <>
      <h1>{active ? '🟢' : error ? '🔴' : '🟠'}</h1>
      <h3>
        <ChainId />
        {/* <BlockNumber /> */}
        <Account />
        {/* <Balance /> */}
      </h3>
    </>
  )
}

