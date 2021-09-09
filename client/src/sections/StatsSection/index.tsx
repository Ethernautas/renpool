import React, { useContext } from 'react'
import { formatUnits } from '@ethersproject/units'
import { Text } from 'rimble-ui'
import { DECIMALS, BOND } from '../../constants'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { SectionLayout } from '../../layouts/SectionLayout'

export const StatsSection = (): JSX.Element => {
  const {
    totalPooled,
    isLocked,
    accountPooled,
  } = useContext(RenPoolContext)

  return (
    <SectionLayout title="Stats">
      <Text.p>Total pooled: {parseInt(formatUnits(totalPooled, DECIMALS), 10)} / {parseInt(formatUnits(BOND, DECIMALS), 10)} REN</Text.p>
      <Text.p>Pool is locked: {isLocked.toString()}</Text.p>
      <Text.p>Your pool balance: {parseInt(formatUnits(accountPooled, DECIMALS), 10)} REN</Text.p>
    </ SectionLayout>
  )
}
