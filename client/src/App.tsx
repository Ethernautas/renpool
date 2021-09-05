import React, { useContext, useState } from 'react'
import { Flash, Flex, Box, Heading, Text } from 'rimble-ui'
import { NETWORKS } from './constants'
import { RenPoolContext } from './context/RenPoolProvider'
import { useActiveWeb3React } from './hooks/useActiveWeb3React'
import { Header } from './components/Header'
import { NavLink } from './components/NavLink'
import { Deposit } from './components/Deposit'
import { Withdraw } from './components/Withdraw'
import { AdminPanel } from './components/AdminPanel'
import { Stats } from './components/Stats'
import { Addresses } from './components/Addresses'
import { Instructions } from './components/Instructions'
import { Footer } from './components/Footer'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

enum Views {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  ADMIN = 'ADMIN',
}

export const App = (): JSX.Element => {
  const { chainId, account } = useActiveWeb3React()
  const { owner, nodeOperator, isLocked } = useContext(RenPoolContext)
  const [view, setView] = useState<Views>(Views.DEPOSIT)

  const isAccountsUnlocked = account != null
  const wrongChain = chainId != parseInt(CHAIN_ID, 10)
  const disabled = !isAccountsUnlocked || wrongChain || isLocked

  // TODO: display darknodeUrl once registered

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
        <Flex justifyContent="center" alignItems="center">
          <NavLink
            label="Deposit"
            disabled={view === Views.DEPOSIT}
            onClick={() => { setView(Views.DEPOSIT) }}
          />
          <Box p={3}>|</Box>
          <NavLink
            label="Withdraw"
            disabled={view === Views.WITHDRAW}
            onClick={() => { setView(Views.WITHDRAW) }}
          />
          {account != null && [owner, nodeOperator].includes(account) && (
            <>
              <Box p={3}>|</Box>
              <NavLink
                label="Admin Panel"
                disabled={view === Views.ADMIN}
                onClick={() => { setView(Views.ADMIN) }}
              />
            </>
          )}
        </Flex>

        <Box p={2} />

        {view === Views.DEPOSIT && (
          <Box>
            <Heading.h3 textAlign="center">Deposit REN</Heading.h3>
            <Box p={3}>
              <Deposit disabled={disabled} />
            </Box>
          </Box>
        )}

        {view === Views.WITHDRAW && (
          <Box>
            <Heading.h3 textAlign="center">Withdraw REN</Heading.h3>
            <Box p={3}>
              <Withdraw disabled={disabled} />
            </Box>
          </Box>
        )}

        {view === Views.ADMIN && (
          <Box>
            <Heading.h3 textAlign="center">Admin Panel</Heading.h3>
            <Box p={3}>
              <AdminPanel />
            </Box>
          </Box>
        )}

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
            <Heading.h4>Addresses</Heading.h4>
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
            <Instructions disabled={disabled} />
          </Box>
        </Box>

        <Footer />
      </div>
    </>
  )
}
