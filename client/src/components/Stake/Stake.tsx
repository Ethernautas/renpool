import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Text, Flex, Box, Form, Input, Button } from 'rimble-ui'
import { CONTRACT_NAMES, MAX_UINT256, DECIMALS } from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useContract } from '../../hooks/useContract'
import { useRenBalance } from '../../hooks/useRenBalance'

enum Actions {
  approve = 'approve',
  deposit = 'deposit',
}

export const Stake = (): JSX.Element => {
  const { account } = useActiveWeb3React()
  const renToken = useContract(CONTRACT_NAMES.RenToken)
  const renPool = useContract(CONTRACT_NAMES.RenPool)
  const balance = useRenBalance()

  const [totalPooled, setTotalPooled] = useState<BigNumber>(BigNumber.from(0))
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<string>('0')
  const [disabled, setDisabled] = useState(false)

  // Query totalPooled once renPool contract is ready
  useEffect(() => {
    if (renPool != null) {
      renPool.totalPooled({ gasLimit: 60000 })
        .then((_totalPooled: BigNumber) => { setTotalPooled(_totalPooled) })
        .catch((e: Error) => { alert(`Error while trying to query totalPooled ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renPool])

  // Query isLocked once renPool contract is ready
  useEffect(() => {
    if (renPool != null) {
      renPool.isLocked({ gasLimit: 60000 })
        .then((_isLocked: boolean) => { setIsLocked(_isLocked) })
        .catch((e: Error) => { alert(`Error while trying to query isLocked ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renPool])

  useEffect(() => {
    if (renToken != null) {
      checkForApproval(BigNumber.from(1))
        .then((_isApproved: boolean) => { console.log('IS APP', _isApproved); setIsApproved(_isApproved) })
        .catch((e: Error) => { alert(`Error while trying to check for approval ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renToken])

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

    let _input
    try {
      _input = BigNumber.from(parseUnits(input, DECIMALS))
    } catch (e) {
      _input = BigNumber.from(0)
    }

    if (_input.lt(BigNumber.from(1))) {
      alert('Please, enter a valid amount.')
      setDisabled(false)
      return
    }

    if (_input.gt(balance)) {
      alert(`Insuficient balance.\nYou have ${parseUnits(balance.toString(), DECIMALS)} REN.`)
      setDisabled(false)
      return
    }

    if (action === Actions.approve) {
      const tx = await renToken.approve(renPool.address, MAX_UINT256)
      await tx.wait() // wait for mining
      const _isApproved = await checkForApproval(_input)
      setIsApproved(_isApproved)
    }

    if (action === Actions.deposit) {
      if (!isApproved) {
        alert('Please, approve the transaction first.',)
        setDisabled(false)
        return
      }

      try {
        const tx = await renPool.deposit(_input, { gasLimit: 200000 })
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
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
      >
        <Text>Total staked: {parseInt(formatUnits(totalPooled, DECIMALS), 10)} REN</Text>
        <Text>Pool is full: {isLocked.toString()}</Text>
      </Flex>
      <Form
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          handleSubmit(e, isApproved ? Actions.deposit : Actions.approve)
        }}
      >
        <Input
          type="number"
          value={input}
          width={1}
          disabled={!isAccountsUnlocked || disabled}
          onChange={handleChange}
        />
        <Box p={2} />
        <Flex
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            type="submit"
            disabled={!isAccountsUnlocked || disabled || isApproved}
            width={1}
          >
                Approve
          </Button>
          <Box p={2} />
          <Button
            type="submit"
            disabled={!isAccountsUnlocked || disabled || !isApproved}
            width={1}
          >
            Deposit
          </Button>
        </Flex>
      </Form>
    </>
  )
}
