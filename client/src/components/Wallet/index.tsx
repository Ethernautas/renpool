import React from 'react'
import { useWeb3React } from '@web3-react/core'
import Web3 from 'web3'
import { injected } from '../../connectors'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { getErrorMessage } from '../../utils/getErrorMessage'


export const Wallet = (): JSX.Element => {
  const { active, account, activate, deactivate, error } = useWeb3React<Web3>() // MetaMask / injected
  const { chainId } = useActiveWeb3React()

  const handleConnect = () => {
    activate(injected)
  }

  return (
    <div>
      <div>ChainId: {chainId}</div>
      <div>Account: {account}</div>
      {active ? (
        <div>✅</div>
      ) : (
        <button type="button" onClick={handleConnect}>
	  Connect
        </button>
      )}
      <div>
        {(active || error) && (
          <button onClick={deactivate}>
	    Deactivate
          </button>
        )}

        {!!error && <h4>{getErrorMessage(error)}</h4>}
      </div>
    </div>
  )
}
