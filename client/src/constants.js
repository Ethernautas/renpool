import BigNumber from 'bignumber.js'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const MAX_UINT256 = new BigNumber(2)
  .pow(256)
  .minus(1)
  .toFixed(0)
