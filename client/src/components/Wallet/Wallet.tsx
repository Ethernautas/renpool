import React, { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { formatUnits } from '@ethersproject/units'
import { Flex, MetaMaskButton, Text, Pill, Box, Blockie } from 'rimble-ui'
import { injected } from '../../connectors'
import { useRenBalance } from '../../hooks/useRenBalance'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { shortAccount } from '../../utils/shortAccount'

const DECIMALS = 18

export const Wallet = (): JSX.Element => {
  const { active, error, account, activate } = useWeb3React<Web3Provider>() // MetaMask / injected
  const balance = useRenBalance()

  useEffect(() => {
    if (!!error) {
      console.error(getErrorMessage(error))
    }
  }, [error])

  if (!!error) {
    <Text>SOMETHING WENT WRONG</Text>
  }

  if (!active) {
    return (
      <MetaMaskButton.Outline
        size="small"
        onClick={() => { activate(injected) }}
      >
          Connect wallet
      </MetaMaskButton.Outline>
    )
  }

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
    >
      <Text>REN: {parseFloat(formatUnits(balance, DECIMALS))}</Text>
      <Box p={1} />
      <Pill>{shortAccount(account)}</Pill>
      <Box p={1} />
      <Blockie opts={{ seed: account }} />
    </Flex>
  )
}
