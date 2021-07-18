import React from 'react'
import {formatUnits} from '@ethersproject/units'
import { useContract } from '../../hooks/useContract'
import { useRenBalance } from '../../hooks/useRenBalance'
import { CONTRACT_NAMES } from '../../constants'

const DECIMALS = 18

export const Balance = (): JSX.Element => {
  const renToken = useContract(CONTRACT_NAMES.RenToken)
  const balance = useRenBalance()

  if (balance == null) {
    return <div>...</div>
  }

  return (
    <div>
      REN Balance: {parseFloat(formatUnits(balance, DECIMALS)).toPrecision(4)} {renToken?.symbol}
    </div>
  )
}
