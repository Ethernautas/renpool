import React, { useState, useEffect, ChangeEvent, FormEvent, ReactElement } from 'react'
import isNumber from 'lodash/isNumber'
import './App.css'
import { getConnector, Connector } from './utils/connectors'
import map from './artifacts/deployments/map.json'
import { MAX_UINT256 } from './constants'

enum EnvName {
  dev = 'dev',
}

enum ContractName {
  RenToken = 'RenToken',
  RenPool = 'RenPool',
}

enum ActionName {
  approve = 'approve',
  deposit = 'deposit',
}

export const App = (): ReactElement => {
  const [connector, setConnector] = useState<Connector | null>(null)
  const [renToken, setRenToken] = useState(null)
  const [renPool, setRenPool] = useState(null)
  const [totalPooled, setTotalPooled] = useState(0)
  const [isApproved, setIsApproved] = useState(false)
  const [amount, setAmount] = useState(0)

  // Load connector on component mount
  useEffect(() => {
    getConnector()
      .then(setConnector)
      .catch((e) => { console.log(`Could not enable accounts. Interaction with contracts not available.
      Use a modern browser with a Web3 plugin to fix this issue.`, e) })
  }, [])

  // Load contracts once connector is ready
  useEffect(() => {
    if (connector != null) {
      loadInitialContracts()
        .catch((e) => { console.log('Could not load contracts', e) })
    }
  }, [connector])

  // Query totalPooled once contracts are ready
  useEffect(() => {
    if (renPool != null) {
      renPool.methods.totalPooled().call()
        .then(setTotalPooled)
    }
  }, [renPool])

  const loadContract = async (chain: EnvName, contractName: ContractName): Promise<any | null> => {
    if (connector == null) return null

    // Get the address of the most recent deployment from the deployment map
    let address
    try {
      address = map[chain][contractName][0]
    } catch (e) {
      console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`,)
      return null
    }

    // Load the artifact with the specified address
    let contractArtifact
    try {
      contractArtifact = await import(`./artifacts/deployments/${chain}/${address}.json`)
    } catch (e) {
      console.log(`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`,)
      return null
    }

    return { ...new connector.web3.eth.Contract(contractArtifact.abi, address), _addr: address }
  }

  const loadInitialContracts = async (): Promise<void> => {
    if (connector == null || connector.chainId <= 42) {
      // Wrong Network!
      return
    }

    const renToken = await loadContract(EnvName.dev, ContractName.RenToken)
    const renPool = await loadContract(EnvName.dev, ContractName.RenPool)

    setRenToken(renToken)
    setRenPool(renPool)
  }

  const isTransferApproved = async (amount?: number): Promise<boolean> => {
    if (renToken == null) return false
    if (!isNumber(amount) || amount < 1) return false
    const allowance = await renToken.methods.allowance(connector.accounts[0], renPool._addr).call()
    return allowance - amount >= 0
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const value = parseInt(e.target.value || '', 10)
    setAmount(value)
    if (value == null) return
    const isApproved = await isTransferApproved(value)
    setIsApproved(isApproved)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: ActionName): Promise<void> => {
    e.preventDefault()

    if (renPool == null) return
    if (!isNumber(amount) || isNaN(amount) || amount < 1) {
      alert('invalid amount')
      return
    }

    if (action === ActionName.approve) {
      await renToken.methods.approve(renPool._addr, MAX_UINT256).send({ from: connector.accounts[0] })
        .on('receipt', async () => { setIsApproved(await isTransferApproved(amount)) })
        .on('error', (e: any) => { console.log('Could not approve transfer', e) })
    }

    if (action === ActionName.deposit) {
      if (!isApproved) {
        alert('you need to approve the transaction first',)
        return
      }

      await renPool.methods.deposit(amount).send({ from: connector.accounts[0] })
        .on('receipt', async () => {
          setTotalPooled(await renPool.methods.totalPooled().call())
          setAmount(0)
        })
        .on('error', (e: any) => { console.log('Could not deposit', e) })
    }
  }

  if (connector?.web3 == null) {
    return <div>Loading Web3, accounts, and contracts...</div>
  }

  if (isNaN(connector?.chainId) || connector?.chainId <= 42) {
    return <div>Wrong Network! Switch to your local RPC &quot;Localhost: 8545&quot; in your Web3 provider (e.g. Metamask)</div>
  }

  if (renToken == null || renPool == null) {
    return <div>Could not find a deployed contract. Check console for details.</div>
  }

  const isAccountsUnlocked = connector?.accounts ? connector?.accounts?.length > 0 : false

  return (
    <div className="App">
      {!isAccountsUnlocked && (
        <p><strong>Connect with Metamask and refresh the page to be able to edit the storage fields.</strong></p>
      )}

      <h2>RenPool Contract</h2>
      <div>The stored value is: {totalPooled}</div>
      <br/>
      <form onSubmit={(e) => { handleSubmit(e, isApproved ? ActionName.deposit : ActionName.approve) }}>
        <div>
          <label>Deposit REN: </label>
          <br/>
          <input
            name="amount"
            type="number"
            value={amount}
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
    </div>
  )
}
