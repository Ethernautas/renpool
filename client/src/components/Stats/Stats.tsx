import React, { useContext } from 'react'
import { formatUnits } from '@ethersproject/units'
import { Text } from 'rimble-ui'
import { DECIMALS, TARGET } from '../../constants'
import { RenPoolContext } from '../../context/RenPoolProvider'

export const Stats = (): JSX.Element => {
  const {
    totalPooled,
    isLocked,
    accountStaked
  } = useContext(RenPoolContext)

  return (
    <>
      <Text.p>Total staked: {parseInt(formatUnits(totalPooled, DECIMALS), 10)} / {TARGET} REN</Text.p>
      <Text.p>Pool is locked: {isLocked.toString()}</Text.p>
      <Text.p>Your staked balance: {parseInt(formatUnits(accountStaked, DECIMALS), 10)} REN</Text.p>
    </>
  )
}
