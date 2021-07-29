import React, { FC, useContext, useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Box, Form, Input, Button } from 'rimble-ui'
import { MAX_UINT256, DECIMALS } from '../../constants'
import { RenTokenContext } from '../../context/RenTokenProvider'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

enum Actions {
  APPROVE = 'APPROVE',
  DEPOSIT = 'DEPOSIT',
}

export interface DepositProps {
  disabled?: boolean
}

export const Deposit: FC<DepositProps> = ({
  disabled: _disabled = false,
}): JSX.Element => {
  const { account } = useActiveWeb3React()
  const { renToken, accountBalance } = useContext(RenTokenContext)
  const {
    renPool,
    refetchTotalPooled,
    refetchIsLocked,
    refetchAccountPooled,
  } = useContext(RenPoolContext)

  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<string>('0')
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (renToken != null && account != null) {
      checkForApproval(BigNumber.from(1))
        .then((_isApproved: boolean) => { setIsApproved(_isApproved) })
        .catch((e: Error) => { alert(`Error checking for approval ${JSON.stringify(e, null, 2)}`) })
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
      _input = BigNumber.from(parseUnits(input, DECIMALS)) // input * 10^18
    } catch (e) {
      _input = BigNumber.from(0)
    }

    if (_input.lt(BigNumber.from(1))) {
      alert('Please, enter a valid amount.')
      setDisabled(false)
      return
    }

    if (_input.gt(accountBalance)) {
      alert(`Insuficient balance.\nYou have ${parseInt(formatUnits(accountBalance.toString(), DECIMALS), 10)} REN.`)
      setDisabled(false)
      return
    }

    if (action === Actions.APPROVE) {
      const tx = await renToken.approve(renPool.address, MAX_UINT256)
      await tx.wait() // wait for mining
      const _isApproved = await checkForApproval(_input)
      setIsApproved(_isApproved)
    }

    if (action === Actions.DEPOSIT) {
      if (!isApproved) {
        alert('Please, approve the transaction first.',)
        setDisabled(false)
        return
      }

      try {
        const tx = await renPool.deposit(_input, { gasLimit: 200000 })
        await tx.wait() // wait for mining
        await refetchTotalPooled()
        await refetchIsLocked()
        await refetchAccountPooled()
        setInput('0')
      } catch (e) {
        alert(`Could not deposit, ${JSON.stringify(e, null, 2)}`)
      }
    }

    setDisabled(false)
  }

  return (
    <Form
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        handleSubmit(e, isApproved ? Actions.DEPOSIT : Actions.APPROVE)
      }}
    >
      <Input
        type="text"
        value={input}
        disabled={_disabled || disabled}
        width={1}
        onChange={handleChange}
      />
      <Box p={2} />
      <Button
        type="submit"
        variant={isApproved ? 'success' : ''}
        disabled={_disabled || disabled}
        width={1}
      >
        {isApproved ? 'Deposit' : 'Approve'}
      </Button>
    </Form>
  )
}
