// import React, { useState, useEffect, ChangeEvent, FormEvent, ReactElement } from 'react'
// import isNumber from 'lodash/isNumber'
// import './App.css'
// import { getConnector, Connector } from './utils/connectors'
// import map from './artifacts/deployments/map.json'
// import { MAX_UINT256 } from './constants'

// const CHAIN = 42

// enum ContractName {
//   RenToken = 'RenToken',
//   RenPool = 'RenPool',
// }

// enum ActionName {
//   approve = 'approve',
//   deposit = 'deposit',
// }

// export const App = (): ReactElement => {
//   const [connector, setConnector] = useState<Connector | null>(null)
//   const [renToken, setRenToken] = useState(null)
//   const [renPool, setRenPool] = useState(null)
//   const [totalPooled, setTotalPooled] = useState(0)
//   const [isApproved, setIsApproved] = useState(false)
//   const [amount, setAmount] = useState(0)

//   // Load connector on component mount
//   useEffect(() => {
//     getConnector()
//       .then(setConnector)
//       .catch((e) => { console.log(`Could not enable accounts. Interaction with contracts not available.
//       Use a modern browser with a Web3 plugin to fix this issue.`, e) })
//   }, [])

//   // Load contracts once connector is ready
//   useEffect(() => {
//     if (connector != null) {
//       loadInitialContracts()
//         .catch((e) => { console.log('Could not load contracts', e) })
//     }
//   }, [connector])

//   // Query totalPooled once contracts are ready
//   useEffect(() => {
//     if (renPool != null) {
//       renPool.methods.totalPooled().call()
//         .then(setTotalPooled)
//     }
//   }, [renPool])

//   const loadContract = async (contractName: ContractName): Promise<any | null> => {
//     console.log('LOAD CONTRACT')
//     if (connector == null) return null

//     // Get the address of the most recent deployment from the deployment map
//     let address
//     try {
//       address = map[CHAIN][contractName][0]
//     } catch (e) {
//       console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${CHAIN}".`,)
//       return null
//     }

//     // Load the artifact with the specified address
//     let contractArtifact
//     try {
//       contractArtifact = await import(`./artifacts/deployments/${CHAIN}/${address}.json`)
//     } catch (e) {
//       console.log(`Failed to load contract artifact "./artifacts/deployments/${CHAIN}/${address}.json"`,)
//       return null
//     }

//     console.log({ address, contractArtifact })

//     return { ...new connector.web3.eth.Contract(contractArtifact.abi, address), _addr: address }
//   }

//   const loadInitialContracts = async (): Promise<void> => {
//     if (connector == null || connector.chainId != CHAIN) {
//       // Wrong Network!
//       return
//     }

//     const renToken = await loadContract(ContractName.RenToken)
//     const renPool = await loadContract(ContractName.RenPool)

//     setRenToken(renToken)
//     setRenPool(renPool)
//   }

//   const isTransferApproved = async (amount?: number): Promise<boolean> => {
//     if (renToken == null) return false
//     if (!isNumber(amount) || amount < 1) return false
//     const allowance = await renToken.methods.allowance(connector.accounts[0], renPool._addr).call()
//     return allowance - amount >= 0
//   }

//   const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
//     const value = parseInt(e.target.value || '', 10)
//     setAmount(value)
//     if (value == null) return
//     const isApproved = await isTransferApproved(value)
//     setIsApproved(isApproved)
//   }

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: ActionName): Promise<void> => {
//     e.preventDefault()

//     if (renPool == null) return
//     if (!isNumber(amount) || isNaN(amount) || amount < 1) {
//       alert('invalid amount')
//       return
//     }

//     if (action === ActionName.approve) {
//       await renToken.methods.approve(renPool._addr, MAX_UINT256).send({ from: connector.accounts[0] })
//         .on('receipt', async () => { setIsApproved(await isTransferApproved(amount)) })
//         .on('error', (e: any) => { console.log('Could not approve transfer', e) })
//     }

//     if (action === ActionName.deposit) {
//       if (!isApproved) {
//         alert('you need to approve the transaction first',)
//         return
//       }

//       await renPool.methods.deposit(amount).send({ from: connector.accounts[0] })
//         .on('receipt', async () => {
//           setTotalPooled(await renPool.methods.totalPooled().call())
//           setAmount(0)
//         })
//         .on('error', (e: any) => { console.log('Could not deposit', e) })
//     }
//   }

//   const getFromFaucet = async () => {
//     await renToken.methods.getFromFaucet().send({ from: connector.accounts[0] })
//       .on('receipt', console.log)
//       .on('error', (e: any) => { console.log('Could not get from faucet', e) })
//   }

//   if (connector?.web3 == null) {
//     return <div>Loading Web3, accounts, and contracts...</div>
//   }

//   if (isNaN(connector?.chainId) || connector?.chainId != CHAIN) {
//     return <div>Wrong Network! Switch to your local RPC &quot;Localhost: 8545&quot; in your Web3 provider (e.g. Metamask)</div>
//   }

//   if (renToken == null || renPool == null) {
//     return <div>Could not find a deployed contract. Check console for details.</div>
//   }

//   const isAccountsUnlocked = connector?.accounts ? connector?.accounts?.length > 0 : false

//   return (
//     <div className="App">
//       {!isAccountsUnlocked && (
//         <p><strong>Connect with Metamask and refresh the page to be able to edit the storage fields.</strong></p>
//       )}

//       <h2>RenPool Contract</h2>
//       <div>The stored value is: {totalPooled}</div>
//       <br/>
//       <form onSubmit={(e) => { handleSubmit(e, isApproved ? ActionName.deposit : ActionName.approve) }}>
//         <div>
//           <label>Deposit REN: </label>
//           <br/>
//           <input
//             name="amount"
//             type="number"
//             value={amount}
//             onChange={handleChange}
//           />
//           <br/>
//           <button
//             type="submit"
//             disabled={!isAccountsUnlocked}
//           >
//             {isApproved ? 'Deposit' : 'Approve'}
//           </button>
//         </div>
//       </form>
//       <br/>
//       <button
//         onClick={getFromFaucet}
//         disabled={!isAccountsUnlocked}
//       >
//         Get from faucet
//       </button>
//     </div>
//   )
// }

import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
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
import { useEagerConnect } from './hooks/useEagerConnect'
import { useInactiveListener } from './hooks/useInactiveListener'
import { injected, network } from './connectors'

import React, { useState, useEffect, ChangeEvent, FormEvent, ReactElement } from 'react'
import isNumber from 'lodash/isNumber'
import './App.css'
// import { getConnector, Connector } from './utils/connectors'
import map from './artifacts/deployments/map.json'
import { MAX_UINT256 } from './constants'
import { Header } from './components/Header'

const CHAIN = 42

enum ContractName {
  RenToken = 'RenToken',
  RenPool = 'RenPool',
}

enum ActionName {
  approve = 'approve',
  deposit = 'deposit',
}

enum ConnectorNames {
  Injected = 'Injected',
  Network = 'Network',
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.Network]: network,
}

const getErrorMessage = (error: Error): string => {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return 'You\'re connected to an unsupported network.'
  } else if (
    error instanceof UserRejectedRequestErrorInjected // ||
    // error instanceof UserRejectedRequestErrorWalletConnect ||
    // error instanceof UserRejectedRequestErrorFrame
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

export const App = () => {
  const context = useWeb3React<Web3>()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)
  // const [connector, setConnector] = useState<Connector | null>(null)
  const [renToken, setRenToken] = useState(null)
  const [renPool, setRenPool] = useState(null)
  const [totalPooled, setTotalPooled] = useState(0)
  const [isApproved, setIsApproved] = useState(false)
  const [amount, setAmount] = useState(0)

  // Load connector on component mount
  // useEffect(() => {
  //   getConnector()
  //     .then(setConnector)
  //     .catch((e) => { console.log(`Could not enable accounts. Interaction with contracts not available.
  //     Use a modern browser with a Web3 plugin to fix this issue.`, e) })
  // }, [])

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

  const loadContract = async (contractName: ContractName): Promise<any | null> => {
    console.log('LOAD CONTRACT')
    if (connector == null) return null

    // Get the address of the most recent deployment from the deployment map
    let address
    try {
      address = map[CHAIN][contractName][0]
    } catch (e) {
      console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${CHAIN}".`,)
      return null
    }

    // Load the artifact with the specified address
    let contractArtifact
    try {
      contractArtifact = await import(`./artifacts/deployments/${CHAIN}/${address}.json`)
    } catch (e) {
      console.log(`Failed to load contract artifact "./artifacts/deployments/${CHAIN}/${address}.json"`,)
      return null
    }

    console.log({ address, contractArtifact })

    return { ...new library.eth.Contract(contractArtifact.abi, address), _addr: address }
  }

  const loadInitialContracts = async (): Promise<void> => {
    if (chainId != CHAIN) {
      // Wrong Network!
      return
    }

    const renToken = await loadContract(ContractName.RenToken)
    const renPool = await loadContract(ContractName.RenPool)

    setRenToken(renToken)
    setRenPool(renPool)
  }

  const isTransferApproved = async (amount?: number): Promise<boolean> => {
    if (renToken == null) return false
    if (!isNumber(amount) || amount < 1) return false
    const allowance = await renToken.methods.allowance(account, renPool._addr).call()
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
      await renToken.methods.approve(renPool._addr, MAX_UINT256).send({ from: account })
        .on('receipt', async () => { setIsApproved(await isTransferApproved(amount)) })
        .on('error', (e: any) => { console.log('Could not approve transfer', e) })
    }

    if (action === ActionName.deposit) {
      if (!isApproved) {
        alert('you need to approve the transaction first',)
        return
      }

      await renPool.methods.deposit(amount).send({ from: account })
        .on('receipt', async () => {
          setTotalPooled(await renPool.methods.totalPooled().call())
          setAmount(0)
        })
        .on('error', (e: any) => { console.log('Could not deposit', e) })
    }
  }

  const getFromFaucet = async () => {
    await renToken.methods.getFromFaucet().send({ from: account })
      .on('receipt', console.log)
      .on('error', (e: any) => { console.log('Could not get from faucet', e) })
  }

  // if (library == null) {
  //   return <div>Loading Web3, accounts, and contracts...</div>
  // }

  // if (isNaN(chainId) || chainId != CHAIN) {
  //   return <div>Wrong Network! Switch to your local RPC &quot;Localhost: 8545&quot; in your Web3 provider (e.g. Metamask)</div>
  // }

  if (renToken == null || renPool == null) {
    return <div>Could not find a deployed contract. Check console for details.</div>
  }

  const isAccountsUnlocked = account != null
  console.log({ account })


  return (
    <>
      <Header />
      <hr />
      <div>
        {(['Injected', 'Network'] as const).map(name => {
          const currentConnector = connectorsByName[name] as (InjectedConnector | NetworkConnector)
          const activating = currentConnector === activatingConnector
          const connected = currentConnector === connector
          const disabled = !triedEager || !!activatingConnector || connected || !!error

          return (
            <button
              style={{ borderColor: activating ? 'orange' : connected ? 'green' : 'unset' }}
              disabled={disabled}
              key={name}
              onClick={() => {
                setActivatingConnector(currentConnector)
                activate(currentConnector)
              }}
            >
              <div>
                {activating && <div>Loading...</div>}
                {connected && (
                  <span role="img" aria-label="check">
                    ✅
                  </span>
                )}
              </div>
              {name}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {(active || error) && (
          <button
            onClick={() => {
              deactivate()
            }}
          >
            Deactivate
          </button>
        )}

        {!!error && <h4>{getErrorMessage(error)}</h4>}
      </div>

      <hr style={{ margin: '2rem' }} />

      <div>
        {!!(library && account) && (
          <button
            onClick={() => {
              // library
              //   .getSigner(account)
              //   .signMessage('👋')
              //   .then((signature: any) => {
              //     window.alert(`Success!\n\n${signature}`)
              //   })
              //   .catch((error: any) => {
              //     window.alert('Failure!' + (error && error.message ? `\n\n${error.message}` : ''))
              //   })
            }}
          >
            Sign Message
          </button>
        )}
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
        <br/>
        <button
          onClick={getFromFaucet}
          disabled={!isAccountsUnlocked}
        >
        Get from faucet
        </button>
      </div>
    </>
  )
}
