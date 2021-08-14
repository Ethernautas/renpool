import React from 'react'
import { createWeb3ReactRoot } from '@web3-react/core'
import { NETWORK_CONTEXT_NAME } from '../constants'

const Web3ReactRoot = createWeb3ReactRoot(NETWORK_CONTEXT_NAME)

export const Web3ProviderNetwork = (
  { children, getLibrary }: { children: JSX.Element, getLibrary: any },
): JSX.Element => (
  <Web3ReactRoot getLibrary={getLibrary}>
    {children}
  </Web3ReactRoot>
)
