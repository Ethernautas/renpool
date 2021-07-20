import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { Flex, Box } from 'rimble-ui'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { Balance } from '../Balance'
import { Wallet } from '../Wallet'

export const Header = (): JSX.Element => {
  const { active, error, account } = useWeb3React() // MetaMask / injected
  const { chainId } = useActiveWeb3React()

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      borderBottom={1}
      borderColor="near-white"
      p={[3, 4]}
      pb={3}
    >
      <Box>{active ? '🟢' : error ? '🔴' : '🟠'}</Box>
      <Box>ChainId: {chainId ?? ''}</Box>
      {/* <BlockNumber /> */}
      <Box>Account: {account == null
        ? 'disconnected'
        : `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
      }
      </Box>
      <Balance />
      <Wallet />
    </Flex>
  )
}

