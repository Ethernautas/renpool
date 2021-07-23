import React from 'react'
import { Flex, Heading } from 'rimble-ui'
import { Wallet } from '../Wallet'

export const Header = (): JSX.Element => (
  <div className="App-header">
    <Flex
      justifyContent="space-between"
      alignItems="center"
      borderBottom={1}
      borderColor="#e2dbe8"
      p={3}
      style={{ height: '100%' }}
    >
      <Heading.h3>RenPool</Heading.h3>
      <Wallet />
    </Flex>
  </div>
)


