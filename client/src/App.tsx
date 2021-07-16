import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
import './App.css'
import { useContract } from './hooks/useContract'
import { NETWORKS, CONTRACT_NAMES, MAX_UINT256 } from './constants'
import { Header } from './components/Header'
import { Wallet } from './components/Wallet'
import { useActiveWeb3React } from './hooks/useActiveWeb3React'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const DECIMALS = 18

enum Actions {
  approve = 'approve',
  deposit = 'deposit',
}

export const App = (): JSX.Element => {
  const { chainId, account } = useActiveWeb3React()
  const renToken = useContract(CONTRACT_NAMES.RenToken)
  const renPool = useContract(CONTRACT_NAMES.RenPool)

  const [totalPooled, setTotalPooled] = useState<BigNumber>(BigNumber.from(0))
  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<string>('')
  const [disabled, setDisabled] = useState(false)

  // Query totalPooled once contracts are ready
  useEffect(() => {
    if (renPool != null) {
      renPool.totalPooled({ gasLimit: 60000 })
        .then((totalPooled: BigNumber) => {
          setTotalPooled(totalPooled) })
        .catch((e: Error) => { alert(`Error while trying to query totalPooled ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renPool])

  const isTransferApproved = async (value: BigNumber): Promise<boolean> => {
    if (renToken == null) return false
    if (value.lt(BigNumber.from(1))) return false
    const allowance: BigNumber = await renToken.allowance(account, renPool.address)
    return allowance.sub(value).gte(BigNumber.from(0))
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const str: string = e.target.value
    const regex = /[0-9]/g
    const value = str.match(regex)?.join('') || ''
    setInput(value)
    if (value == null || value === '') return
    const _isApproved = await isTransferApproved(BigNumber.from(parseUnits(value, DECIMALS)))
    setIsApproved(_isApproved)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: Actions): Promise<void> => {
    e.preventDefault()
    setDisabled(true)

    if (renPool == null) return

    if (BigNumber.from(input).lt(BigNumber.from(1))) {
      alert('invalid amount')
      setDisabled(false)
      return
    }

    if (action === Actions.approve) {
      const tx = await renToken.approve(renPool.address, MAX_UINT256)
      await tx.wait() // wait for mining
      const _isApproved = await isTransferApproved(BigNumber.from(parseUnits(input, DECIMALS)))
      setIsApproved(_isApproved)
    }

    if (action === Actions.deposit) {
      if (!isApproved) {
        alert('you need to approve the transaction first',)
        setDisabled(false)
        return
      }

      try {
        const renAmount = BigNumber.from(parseUnits(input, DECIMALS))
        console.log('REN AMOUNT', renAmount)
        const tx = await renPool.deposit(renAmount, { gasLimit: 200000 })
        await tx.wait() // wait for mining
        const _totalPooled: BigNumber = await renPool.totalPooled({ gasLimit: 60000 })
        setTotalPooled(BigNumber.from(_totalPooled))
        setInput('0')
      } catch (e) {
        alert(`Could not deposit, ${JSON.stringify(e, null, 2)}`)
      }
    }

    setDisabled(false)
  }

  const getFromFaucet = async () => {
    try {
      const tx = await renToken.getFromFaucet({ gasLimit: 60000 })
      await tx.wait() // wait for mining
    } catch (e) {
      alert(`Could not get from faucet ${JSON.stringify(e, null, 2)}`)
    }
  }

  const isAccountsUnlocked = account != null

  return (
    <>
      <Header />
      <Wallet />
      <hr />

      <div className="App">
        {!isAccountsUnlocked && (
          <p><strong>Connect with Metamask and refresh the page to be able to edit the storage fields.</strong></p>
        )}

        {chainId != parseInt(CHAIN_ID, 10) && (
          <p><strong>Connect to {NETWORKS[CHAIN_ID]}.</strong></p>
        )}

        <h2>RenPool Contract</h2>
        <div>The stored value is: {formatUnits(totalPooled, DECIMALS)}</div>
        <br/>
        <form onSubmit={(e) => { handleSubmit(e, isApproved ? Actions.deposit : Actions.approve) }}>
          <div>
            <label>Deposit REN: </label>
            <br/>
            <input
              name="amount"
              type="text"
              value={input}
              disabled={!isAccountsUnlocked || disabled}
              onChange={handleChange}
            />
            <br/>
            <button
              type="submit"
              disabled={!isAccountsUnlocked || disabled || input == null || input.replaceAll('0', '') === ''}
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
      <div>RenToken contract {renToken?.address || ''}</div>
    </>
  )
}
