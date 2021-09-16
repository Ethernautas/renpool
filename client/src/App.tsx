import React, { useContext, useState } from 'react'
import { Flex, Box } from 'rimble-ui'
import { RenPoolContext } from './context/RenPoolProvider'
import { useActiveWeb3React } from './hooks/useActiveWeb3React'
import { DepositScreen } from './screens/DepositScreen'
import { WithdrawScreen } from './screens/WithdrawScreen'
import { AdminScreen } from './screens/AdminScreen'
import { StatsSection } from './sections/StatsSection'
import { AddressesSection } from './sections/AddressesSection'
import { Header } from './components/Header'
import { Banners } from './components/Banners'
import { NavLink } from './components/NavLink'
// import { Instructions } from './components/Instructions'
import { Footer } from './components/Footer'

enum Views {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  ADMIN = 'ADMIN',
}

export const App = (): JSX.Element => {
  const { account } = useActiveWeb3React()
  const { owner, nodeOperator } = useContext(RenPoolContext)
  const [view, setView] = useState<Views>(Views.DEPOSIT)

  // TODO: display darknodeUrl once registered

  return (
    <>
      <Header />

      <div className="App">
        <Banners />

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
                label="Admin"
                disabled={view === Views.ADMIN}
                onClick={() => { setView(Views.ADMIN) }}
              />
            </>
          )}
        </Flex>

        <Box p={2} />

        {view === Views.DEPOSIT && (
          <DepositScreen />
        )}

        {view === Views.WITHDRAW && (
          <WithdrawScreen />
        )}

        {view === Views.ADMIN && (
          <AdminScreen />
        )}

        {[Views.DEPOSIT, Views.WITHDRAW].includes(view) && (
          <>
            <Box p={3} />
            <StatsSection />
            <Box p={2} />
            <AddressesSection />
            <Box p={2} />
            {/* <Instructions /> */}
          </>
        )}

        <Footer />
      </div>
    </>
  )
}
