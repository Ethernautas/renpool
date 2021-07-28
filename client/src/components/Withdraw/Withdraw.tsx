import React, { useContext, useState, ChangeEvent, FormEvent } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Box, Form, Input, Button } from 'rimble-ui'
import { DECIMALS } from '../../constants'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

export const Withdraw = (): JSX.Element => {
  const { account } = useActiveWeb3React()

  const {
    renPool,
    isLocked,
    accountStaked,
    refetchTotalPooled,
    refetchAccountStaked,
  } = useContext(RenPoolContext)

  const [input, setInput] = useState<string>('0')
  const [disabled, setDisabled] = useState(false)

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const str: string = e.target.value
    const regex = /[0-9]/g
    const value = str.match(regex)?.join('') || ''
    setInput(value)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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

    if (_input.gt(accountStaked)) {
      alert(`Insufficient balance.\nYou have deposited ${parseInt(formatUnits(accountStaked.toString(), DECIMALS), 10)} REN.`)
      setDisabled(false)
      return
    }

    try {
      const tx = await renPool.withdraw(_input, { gasLimit: 200000 })
      await tx.wait() // wait for mining
      await refetchTotalPooled()
      await refetchAccountStaked()
      setInput('0')
    } catch (e) {
      alert(`Could not withdraw, ${JSON.stringify(e, null, 2)}`)
    }

    setDisabled(false)
  }

  const isAccountsUnlocked = account != null

  return (
    <Form
      onSubmit={(e: FormEvent<HTMLFormElement>) => { handleSubmit(e) }}
    >
      <Input
        type="text"
        value={input}
        disabled={!isAccountsUnlocked || disabled || isLocked}
        width={1}
        onChange={handleChange}
      />
      <Box p={2} />
      <Button
        type="submit"
        variant="danger"
        disabled={!isAccountsUnlocked || disabled || isLocked}
        width={1}
      >
        Withdraw
      </Button>
    </Form>
  )
}
