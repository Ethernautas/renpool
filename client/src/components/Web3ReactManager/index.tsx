import React, { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { network } from '../../connectors'
import { useEagerConnect } from '../../hooks/useEagerConnect'
import { useInactiveListener } from '../../hooks/useInactiveListener'
import { NETWORK_CONTEXT_NAME } from '../../constants'

// Source: https://blog.infura.io/dapp-frontend-network/
// How this works is that in the above code we import useWeb3 from the React
// implementation of Network JS (@openzeppelin/network/react) in order to get
// a web3Context. This is a Javascript hook that will attempt to retrieve an
// injected web3 provider which, by default, is MetaMask. If no provider is injected,
// it will use the Infura URL set as web3Context. The term injected means code or
// data that comes from a user's browser and is available for the website to use.

// The useWeb3 hook attempts to obtain an injected web3 provider first,
// before falling back to a network connection. Alternatively use useWeb3Injected
// for an injected web3 provider or useWeb3Network for a network provider
// such as Infura or a private node.
export const Web3ReactManager = ({ children }: { children: JSX.Element }): JSX.Element => {
  const { active } = useWeb3React()
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NETWORK_CONTEXT_NAME)

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network)
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true)
    }, 600)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!active && networkError) {
    return (
      <div>
        Oops! An unknown error occurred. Please refresh the page, or visit from another browser or device.
      </div>
    )
  }

  // if neither context is active, spin
  if (!active && !networkActive) {
    return showLoader ? (
      <div>
	      Loading...
      </div>
    ) : null
  }

  return children
}
