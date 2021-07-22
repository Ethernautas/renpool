import React from 'react'
import { Flash, Box } from 'rimble-ui'
import './App.css'
import { NETWORKS } from './constants'
import { useActiveWeb3React } from './hooks/useActiveWeb3React'
import { Header } from './components/Header'
import { RenPool } from './components/RenPool'
import { FAQs } from './components/FAQs'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export const App = (): JSX.Element => {
  const { chainId, account } = useActiveWeb3React()

  const isAccountsUnlocked = account != null
  const wrongChain = chainId != parseInt(CHAIN_ID, 10)

  return (
    <>
      <Header />
      <div className="App">
        {!isAccountsUnlocked && (
          <Flash my={3} variant="warning">
            Please, connect with MetaMask
          </Flash>
        )}
        {wrongChain && (
          <Flash my={3} variant="warning">
            Please, switch network to {NETWORKS[CHAIN_ID]}
          </Flash>
        )}
        <RenPool />
        <Box p={3} />
        <FAQs />
      </div>
    </>
  )
}
