import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { DECIMALS } from '../constants'

export const str2BN = (str: string): BigNumber => {
  let bn
  try {
    bn = BigNumber.from(parseUnits(str, DECIMALS)) // input * 10^18
  } catch (e) {
    bn = BigNumber.from(0)
  }
  return bn
}
