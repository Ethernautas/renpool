import React from 'react'
import { Flash, Box, Heading } from 'rimble-ui'
import { NETWORKS } from './constants'
import { useActiveWeb3React } from './hooks/useActiveWeb3React'
import { Header } from './components/Header'
import { Stake } from './components/Stake'
import { HowItWorks } from './components/HowItWorks'
import { Footer } from './components/Footer'

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
        <Box p={2} />
        <Box>
          <Heading.h3 textAlign="center">Stake Ren</Heading.h3>
          <Box p={2} />
          <Box bg="white" p={3}>
            <Stake />
          </Box>
        </Box>
        <Box p={4} />
        <Box>
          <Heading.h3 textAlign="center">How it works</Heading.h3>
          <Box p={2} />
          <Box bg="white" p={3}>
            <HowItWorks />
          </Box>
        </Box>
        <Footer />
      </div>
    </>
  )
}
