import React, { useContext, useState } from 'react'
import { Flash, Flex, Box, Heading, Text, Link } from 'rimble-ui'
import { NETWORKS } from './constants'
import { linkTheme } from './theme'
import { RenPoolContext } from './context/RenPoolProvider'
import { useActiveWeb3React } from './hooks/useActiveWeb3React'
import { Header } from './components/Header'
import { Stats } from './components/Stats'
import { Stake } from './components/Stake'
import { Withdraw } from './components/Withdraw'
import { Addresses } from './components/Addresses'
import { Instructions } from './components/Instructions'
import { Footer } from './components/Footer'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

enum Views {
  STAKE = 'STAKE',
  WITHDRAW = 'WITHDRAW',
}

export const App = (): JSX.Element => {
  const { chainId, account } = useActiveWeb3React()

  const { isLocked } = useContext(RenPoolContext)

  const [view, setView] = useState<Views>(Views.STAKE)

  const isAccountsUnlocked = account != null
  const wrongChain = chainId != parseInt(CHAIN_ID, 10)
  const stakeView = view === Views.STAKE

  return (
    <>
      <Header />

      <div className="App">
        {!isAccountsUnlocked && (
          <Box p={3}>
            <Flash my={3} variant="warning">
              Please, connect with MetaMask
            </Flash>
          </Box>
        )}

        {wrongChain && (
          <Box p={3}>
            <Flash my={3} variant="warning">
              Please, switch network to <Text.span fontWeight={600}>{NETWORKS[CHAIN_ID]}</Text.span>
            </Flash>
          </Box>
        )}

        {isLocked && (
          <Box p={3}>
            <Flash my={3} variant="success">
              The pool is locked
            </Flash>
          </Box>
        )}

        <Box p={2} />

        <Box>
          <Heading.h3 textAlign="center">{stakeView ? 'Stake' : 'Withdraw'} REN</Heading.h3>
          <Box p={3}>
            {stakeView ? <Stake /> : <Withdraw />}
          </Box>
          <Box p={2} />
          <Flex justifyContent="center" alignItems="center">
            <Link
              href=""
              {...linkTheme}
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.preventDefault()
                setView(stakeView ? Views.WITHDRAW : Views.STAKE)
              }}
            >
              Switch to {stakeView ? 'Withdraw' : 'Stake'}
            </Link>
          </Flex>
        </Box>

        <Box p={3} />
        <Box>
          <Box px={3}>
            <Heading.h4>Stats</Heading.h4>
          </Box>
          <Box p={3} py={1}>
            <Stats />
          </Box>
        </Box>

        <Box p={2} />
        <Box>
          <Box px={3}>
            <Heading.h4>Contract Addresses</Heading.h4>
          </Box>
          <Box p={3} py={1}>
            <Addresses />
          </Box>
        </Box>

        <Box p={2} />
        <Box>
          <Box px={3}>
            <Heading.h4>Instructions</Heading.h4>
          </Box>
          <Box p={3} py={1}>
            <Instructions />
          </Box>
        </Box>

        <Footer />
      </div>
    </>
  )
}
