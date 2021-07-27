import React, { useContext, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { formatUnits } from '@ethersproject/units'
import { Flex, MetaMaskButton, Text, Pill, Box } from 'rimble-ui'
import { DECIMALS } from '../../constants'
import { injected } from '../../connectors'
import { RenTokenContext } from '../../context/RenTokenProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { shortAccount } from '../../utils/shortAccount'

export const Wallet = (): JSX.Element => {
  const { active, error, account, activate } = useWeb3React<Web3Provider>() // MetaMask / injected

  const { accountBalance } = useContext(RenTokenContext)

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
      <Text>{parseFloat(formatUnits(accountBalance, DECIMALS))} REN</Text>
      <Box p={2} />
      <Pill>{shortAccount(account)}</Pill>
    </Flex>
  )
}
