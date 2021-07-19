import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { MetaMaskButton, Button } from 'rimble-ui'
import { injected } from '../../connectors'
import { getErrorMessage } from '../../utils/getErrorMessage'


export const Wallet = (): JSX.Element => {
  const { active, activate, deactivate, error } = useWeb3React<Web3Provider>() // MetaMask / injected

  const handleConnect = () => {
    activate(injected)
  }

  return (
    <>
      {!active && (
        <MetaMaskButton.Outline size="medium" onClick={handleConnect}>
          Connect with MetaMask
        </MetaMaskButton.Outline>
      )}
      <div>
        {(active || error) && (
          <Button onClick={deactivate}>
	          Disconnect
          </Button>
        )}

        {!!error && <h4>{getErrorMessage(error)}</h4>}
      </div>
    </>
  )
}
