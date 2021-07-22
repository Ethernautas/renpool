import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Heading, Text, Flex, Box, Form, Field, Input, Button } from 'rimble-ui'
import { CONTRACT_NAMES, MAX_UINT256 } from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useContract } from '../../hooks/useContract'

const DECIMALS = 18

enum Actions {
  approve = 'approve',
  deposit = 'deposit',
}

export const RenPool = (): JSX.Element => {
  const { account } = useActiveWeb3React()
  const renToken = useContract(CONTRACT_NAMES.RenToken)
  const renPool = useContract(CONTRACT_NAMES.RenPool)

  const [totalPooled, setTotalPooled] = useState<BigNumber>(BigNumber.from(0))
  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<string>('0')
  const [disabled, setDisabled] = useState(false)

  // Query totalPooled once contracts are ready
  useEffect(() => {
    if (renPool != null) {
      renPool.totalPooled({ gasLimit: 60000 })
        .then((totalPooled: BigNumber) => {
          setTotalPooled(totalPooled) })
        .catch((e: Error) => { alert(`Error while trying to query totalPooled ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renPool])

  const checkForApproval = async (value: BigNumber): Promise<boolean> => {
    if (renToken == null) return false
    if (value.lt(BigNumber.from(1))) return false
    const allowance: BigNumber = await renToken.allowance(account, renPool.address)
    return allowance.sub(value).gte(BigNumber.from(0))
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const str: string = e.target.value
    const regex = /[0-9]/g
    const value = str.match(regex)?.join('') || ''
    setInput(value)
    if (value == null || value === '') return
    const _isApproved = await checkForApproval(BigNumber.from(parseUnits(value, DECIMALS)))
    setIsApproved(_isApproved)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: Actions): Promise<void> => {
    e.preventDefault()
    setDisabled(true)

    if (renPool == null) return

    if (BigNumber.from(input).lt(BigNumber.from(1))) {
      alert('invalid amount')
      setDisabled(false)
      return
    }

    if (action === Actions.approve) {
      const tx = await renToken.approve(renPool.address, MAX_UINT256)
      await tx.wait() // wait for mining
      const _isApproved = await checkForApproval(BigNumber.from(parseUnits(input, DECIMALS)))
      setIsApproved(_isApproved)
    }

    if (action === Actions.deposit) {
      if (!isApproved) {
        alert('you need to approve the transaction first',)
        setDisabled(false)
        return
      }

      try {
        const renAmount = BigNumber.from(parseUnits(input, DECIMALS))
        console.log('REN AMOUNT', renAmount)
        const tx = await renPool.deposit(renAmount, { gasLimit: 200000 })
        await tx.wait() // wait for mining
        const _totalPooled: BigNumber = await renPool.totalPooled({ gasLimit: 60000 })
        setTotalPooled(BigNumber.from(_totalPooled))
        setInput('0')
      } catch (e) {
        alert(`Could not deposit, ${JSON.stringify(e, null, 2)}`)
      }
    }

    setDisabled(false)
  }

  const isAccountsUnlocked = account != null

  return (
    <Box>
      <Heading.h3 textAlign="center">Stake Ren</Heading.h3>
      <Box p={2} />
      <Box bg="white" p={3}>
        <Flex
          alignItems="center"
          justifyContent="space-between"
        >
          <Text>Total staked: {formatUnits(totalPooled, DECIMALS)}</Text>
          <Text>Pool is locked: ?</Text>
        </Flex>
        <Form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            handleSubmit(e, isApproved ? Actions.deposit : Actions.approve)
          }}
          // validated={formValidated}
        >
          <Field /* validated={validated} */ width={1}>
            <Input
              type="number"
              required // set required attribute to use brower's HTML5 input validation
              value={input}
              width={1}
              disabled={!isAccountsUnlocked || disabled}
              onChange={handleChange}
            />
          </Field>
          <Button
            type="submit"
            disabled={!isAccountsUnlocked || disabled || input == null || input.replaceAll('0', '') === ''}
            width={1}
          >
            {isApproved ? 'Deposit' : 'Approve'}
          </Button>
        </Form>
      </Box>
    </Box>
  )
}
