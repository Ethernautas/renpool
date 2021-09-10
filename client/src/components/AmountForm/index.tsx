import React, { FC, useState, ChangeEvent, FormEvent } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Box, Form, Input, Button } from 'rimble-ui'
import { ButtonVariants } from '../../types/button'
import { DECIMALS } from '../../constants'
import { str2BN } from '../../utils/str2BN'

export interface Props {
  btnLabel: string
  btnVariant?: keyof typeof ButtonVariants
  disabled: boolean
  upperBound: BigNumber
  onBefore?: () => void
  onClientCancel?: () => void
  onClientError?: (err?: string) => void
  onSuccess?: (amount: BigNumber) => void
}

export const AmountForm: FC<Props> = ({
  btnLabel = 'Submit',
  btnVariant = ButtonVariants.default,
  disabled,
  upperBound,
  onBefore = () => null,
  onClientCancel = () => null,
  onClientError = () => null,
  onSuccess = () => null,
}): JSX.Element => {
  const [amount, setAmount] = useState<string>('0')

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const str: string = e.target.value
    // Enforce numbers only
    const regex = /[0-9]/g
    const _amount = str.match(regex)?.join('') || ''
    setAmount(_amount)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // Run 'before' logic if provided and return on error
    try {
      onBefore()
    } catch (e) {
      onClientCancel()
      return // return silently
    }

    const _amount = str2BN(amount)

    // Validate input. In case of errors, display on UI and return handler to parent component
    if (_amount.lt(BigNumber.from(1))) {
      onClientError('Please, enter a valid amount.')
      return
    }

    if (_amount.gt(upperBound)) {
      onClientError(`Insufficient balance (${parseInt(formatUnits(upperBound.toString(), DECIMALS), 10)} REN).`)
      return
    }

    // Pass event up to parent component
    onSuccess(_amount)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        value={amount}
        disabled={disabled}
        width={1}
        onChange={handleChange}
      />
      <Box p={2} />
      <Button
        type="submit"
        variant={btnVariant}
        disabled={disabled}
        width={1}
      >
        {btnLabel}
      </Button>
    </Form>
  )
}
