import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
// import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
// import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from '@web3-react/frame-connector'
// import { Web3Provider } from '@ethersproject/providers'
import Web3 from 'web3'
// import { formatEther } from '@ethersproject/units'
// import { useEagerConnect } from './hooks/useEagerConnect'
// import { useInactiveListener } from './hooks/useInactiveListener'
import { injected, network } from './connectors'

import React, { useState, useEffect, ChangeEvent, FormEvent, ReactElement } from 'react'
import isNumber from 'lodash/isNumber'
import './App.css'
// import { getConnector, Connector } from './utils/connectors'
// import map from './artifacts/deployments/map.json'
import { useContract } from './hooks/useContract'
import { MAX_UINT256 } from './constants'
import { Header } from './components/Header'
import { Wallet } from './components/Wallet'
import { ethers, BigNumber } from 'ethers'
import { useActiveWeb3React } from './hooks/useActiveWeb3React'
import { type } from 'os'

const CHAIN_ID = 1337 // process.env.REACT_APP_CHAIN_ID
const DECIMALS = 18

enum ContractNames {
  RenToken = 'RenToken',
  RenPool = 'RenPool',
}

enum ActionNames {
  approve = 'approve',
  deposit = 'deposit',
}

export const App = () => {
  const context = useActiveWeb3React()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context
  console.log('ACTIVE CONNECTION', chainId, 'ACCOUNT', account)

  const renToken = useContract(ContractNames.RenToken)
  const renPool = useContract(ContractNames.RenPool)

  const [totalPooled, setTotalPooled] = useState<BigNumber>(BigNumber.from(0))
  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<string | null>()
  const [disabled, setDisabled] = useState(false)

  // Query totalPooled once contracts are ready
  useEffect(() => {
    if (renPool != null) {
      renPool.methods.totalPooled().call()
        .then((totalPooled: string) => {
          console.log('TOTAL POLLED', typeof totalPooled, totalPooled)
          setTotalPooled(BigNumber.from(totalPooled)) })
        .catch((e: Error) => { console.log(`Error while trying to query totalPooled ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renPool])

  const isTransferApproved = async (value: BigNumber): Promise<boolean> => {
    if (renToken == null) return false
    if (value.lt(1)) return false
    const allowance: string = await renToken.methods.allowance(account, renPool.options.address).call()
    return BigNumber.from(allowance).sub(value).gte(0)
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const str: string = e.target.value
    const regex = /[0-9]/g
    const value = str.match(regex)?.join('')
    setInput(value)
    if (value == null) return
    const isApproved = await isTransferApproved(BigNumber.from(value.padEnd(value.length + DECIMALS, '0')))
    setIsApproved(isApproved)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: ActionNames): Promise<void> => {
    e.preventDefault()

    if (renPool == null) return
    if (BigNumber.from(input).lt(1)) {
      alert('invalid amount')
      return
    }

    if (action === ActionNames.approve) {
      await renToken.methods.approve(renPool.options.address, MAX_UINT256).send({ from: account })
      setIsApproved(await isTransferApproved(BigNumber.from(input.padEnd(input.length + DECIMALS, '0'))))
      // .on('receipt', async () => { setIsApproved(await isTransferApproved(amount)) })
      // .on('error', (e: any) => { console.log('Could not approve transfer', e) })
    }

    if (action === ActionNames.deposit) {
      if (!isApproved) {
        alert('you need to approve the transaction first',)
        return
      }

      try {
        await renPool.methods.deposit(BigNumber.from(input.padEnd(input.length + DECIMALS, '0')).toString()).send({ from: account })
          .on('receipt', async () => {
            setTotalPooled(await renPool.methods.totalPooled().call())
            setInput('0')
          })
          .on('error', (e: any) => { console.log('Could not deposit', e) })
      } catch (e) {
        alert(`Could not deposit, ${JSON.stringify(e, null, 2)}`)
      }
    }
  }

  const getFromFaucet = async () => {
    try {
      await renToken.methods.getFromFaucet().send({ from: account })
    } catch (e) {
      alert(`Could not get from faucet ${JSON.stringify(e, null, 2)}`)
    }
  }

  const isAccountsUnlocked = account != null
  console.log({ account })

  const strTotalPooled = totalPooled.toString()
  // TODO: use:
  // ethers.utils.formatUnits(balance, 18)
  // const dai = ethers.utils.parseUnits("1.0", 18)
  // source: https://docs.ethers.io/v5/single-page/

  return (
    <>
      <Header />
      <Wallet />
      <hr />

      <div>
        {/* {!!(library && account) && (
          <button
            onClick={() => {
              library
                .getSigner(account)
                .signMessage('👋')
                .then((signature: any) => {
                  window.alert(`Success!\n\n${signature}`)
                })
                .catch((error: any) => {
                  window.alert('Failure!' + (error && error.message ? `\n\n${error.message}` : ''))
                })
            }}
          >
            Sign Message
          </button>
        )} */}
        {/* {!!(connector === connectorsByName[ConnectorNames.Network] && chainId) && (
          <button
            onClick={() => {
              ;(connector as any).changeChainId(chainId === 1 ? CHAIN : 1)
            }}
          >
            Switch Networks
          </button>
        )} */}
      </div>
      <div className="App">
        {!isAccountsUnlocked && (
          <p><strong>Connect with Metamask and refresh the page to be able to edit the storage fields.</strong></p>
        )}

        {chainId != CHAIN_ID && (
          <p><strong>Connect to chainId {CHAIN_ID}.</strong></p>
        )}

        <h2>RenPool Contract</h2>
        <div>The stored value is: {strTotalPooled.length > DECIMALS ? strTotalPooled.slice(0, strTotalPooled.length - DECIMALS) : strTotalPooled}</div>
        <br/>
        <form onSubmit={(e) => { handleSubmit(e, isApproved ? ActionNames.deposit : ActionNames.approve) }}>
          <div>
            <label>Deposit REN: </label>
            <br/>
            <input
              name="amount"
              type="text"
              value={input}
              disabled={!isAccountsUnlocked}
              onChange={handleChange}
            />
            <br/>
            <button
              type="submit"
              disabled={!isAccountsUnlocked}
            >
              {isApproved ? 'Deposit' : 'Approve'}
            </button>
          </div>
        </form>
        <br/>
        <button
          onClick={getFromFaucet}
          disabled={!isAccountsUnlocked}
        >
          Get free REN
        </button>
      </div>
      <div>RenToken contract {renToken?.options?.address || ''}</div>
    </>
  )
}
