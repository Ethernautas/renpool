import React, { useState } from 'react'
import { Flash, Flex, Box, Heading, Link } from 'rimble-ui'
import { NETWORKS } from './constants'
import { useActiveWeb3React } from './hooks/useActiveWeb3React'
import { Header } from './components/Header'
import { Stake } from './components/Stake'
import { Withdraw } from './components/Withdraw'
import { Instructions } from './components/Instructions'
import { Footer } from './components/Footer'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

enum Views {
  STAKE = 'STAKE',
  WITHDRAW = 'WITHDRAW',
}

export const App = (): JSX.Element => {
  const { chainId, account } = useActiveWeb3React()

  const [view, setView] = useState<Views>(Views.STAKE)

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

        {view === Views.STAKE && (
          <Box>
            <Heading.h3 textAlign="center">Stake Ren</Heading.h3>
            <Box p={2} />
            <Box bg="white" p={3}>
              <Stake />
            </Box>
            <Box p={1} />
            <Flex justifyContent="center" alignItems="center">
              <Link
                href=""
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.preventDefault()
                  setView(Views.WITHDRAW)
                }}
              >
              Withdraw
              </Link>
            </Flex>
          </Box>
        )}

        {view === Views.WITHDRAW && (
          <Box>
            <Heading.h3 textAlign="center">Withdraw Ren</Heading.h3>
            <Box p={2} />
            <Box bg="white" p={3}>
              <Withdraw />
            </Box>
            <Box p={1} />
            <Flex justifyContent="center" alignItems="center">
              <Link
                href=""
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.preventDefault()
                  setView(Views.STAKE)
                }}
              >
              Stake
              </Link>
            </Flex>
          </Box>
        )}

        <Box p={4} />
        <Box>
          <Heading.h3 textAlign="center">Instructions</Heading.h3>
          <Box p={2} />
          <Box bg="white" p={3}>
            <Instructions />
          </Box>
        </Box>

        <Footer />
      </div>
    </>
  )
}
