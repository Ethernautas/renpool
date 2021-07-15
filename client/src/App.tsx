import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import './App.css'
import { useContract } from './hooks/useContract'
import { NETWORKS, CONTRACT_NAMES, MAX_UINT256 } from './constants'
import { Header } from './components/Header'
import { Wallet } from './components/Wallet'
import BigNumber from 'bignumber.js'
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

  const [totalPooled, setTotalPooled] = useState<BigNumber>(new BigNumber(0))
  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<string | null>()
  const [disabled, setDisabled] = useState(false)

  // Query totalPooled once contracts are ready
  useEffect(() => {
    if (renPool != null) {
      renPool.methods.totalPooled().call()
        .then((totalPooled: string) => { setTotalPooled(new BigNumber(totalPooled)) })
        .catch((e: Error) => { alert(`Error while trying to query totalPooled ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renPool])

  const isTransferApproved = async (value: BigNumber): Promise<boolean> => {
    if (renToken == null) return false
    if (value.lt(1)) return false
    const allowance: string = await renToken.methods.allowance(account, renPool.options.address).call()
    return new BigNumber(allowance).minus(value).gte(new BigNumber(0))
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const str: string = e.target.value
    const regex = /[0-9]/g
    const value = str.match(regex)?.join('') || ''
    setInput(value)
    if (value == null) return
    const isApproved = await isTransferApproved(new BigNumber(value.padEnd(value.length + DECIMALS, '0')))
    setIsApproved(isApproved)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: Actions): Promise<void> => {
    e.preventDefault()
    setDisabled(true)

    if (renPool == null) return

    if (new BigNumber(input).lt(new BigNumber(1))) {
      alert('invalid amount')
      setDisabled(false)
      return
    }

    if (action === Actions.approve) {
      await renToken.methods.approve(renPool.options.address, MAX_UINT256).send({ from: account })
      setIsApproved(await isTransferApproved(new BigNumber(input.padEnd(input.length + DECIMALS, '0'))))
      // .on('receipt', async () => { setIsApproved(await isTransferApproved(amount)) })
      // .on('error', (e: any) => { console.log('Could not approve transfer', e) })
    }

    if (action === Actions.deposit) {
      if (!isApproved) {
        alert('you need to approve the transaction first',)
        setDisabled(false)
        return
      }

      try {
        const renAmount = new BigNumber(input.padEnd(input.length + DECIMALS, '0')).toString()
        await renPool.methods.deposit(renAmount).send({ from: account })
          .on('receipt', async () => {
            setTotalPooled(await renPool.methods.totalPooled().call())
            setInput('0')
          })
          .on('error', (e: Error) => { console.log('Could not deposit', JSON.stringify(e, null, 2)) })
      } catch (e) {
        alert(`Could not deposit, ${JSON.stringify(e, null, 2)}`)
      }
    }

    setDisabled(false)
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

        {chainId != parseInt(CHAIN_ID, 10) && (
          <p><strong>Connect to {NETWORKS[CHAIN_ID]}.</strong></p>
        )}

        <h2>RenPool Contract</h2>
        <div>The stored value is: {strTotalPooled.length > DECIMALS ? strTotalPooled.slice(0, strTotalPooled.length - DECIMALS) : strTotalPooled}</div>
        <br/>
        <form onSubmit={(e) => { handleSubmit(e, isApproved ? Actions.deposit : Actions.approve) }}>
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
              disabled={!isAccountsUnlocked || disabled}
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
