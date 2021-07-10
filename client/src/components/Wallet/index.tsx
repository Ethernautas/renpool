import React from 'react'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { injected } from '../../connectors'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { getErrorMessage } from '../../utils/getErrorMessage'


export const Wallet = (): JSX.Element => {
  const { active, account, activate, deactivate, error } = useWeb3ReactCore<Web3Provider>() // Metamask/injected
  const { chainId } = useActiveWeb3React()

  const onClick = () => {
	  activate(injected)
  }

  return (
	  <div>
	    <div>ChainId: {chainId}</div>
	    <div>Account: {account}</div>
	    {active ? (
	      <div>✅ </div>
	    ) : (
	      <button type="button" onClick={onClick}>
		Connect
	      </button>
	    )}
	          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
