import { useContext, useState, useEffect } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { RenTokenContext } from '../context/RenTokenProvider'

export interface RenAllowanceApi {
  isAllowed: boolean
  checkForAllowance: () => void
}

export const useRenAllowance = (owner: string | null, spender: string | null, amount: BigNumber): RenAllowanceApi => {
  const { renToken } = useContext(RenTokenContext)

  const [isAllowed, setIsAllowed] = useState<boolean>(false)
  const [refetch, setRefetch] = useState<boolean>(false)

  const checkForAllowance = async (value: BigNumber): Promise<boolean> => {
    if (renToken == null || owner == null || spender == null) return false
    if (value.lt(BigNumber.from(1))) return false
    const allowance: BigNumber = await renToken.allowance(owner, spender)
    return allowance.sub(value).gte(BigNumber.from(0))
  }

  useEffect(() => {
    checkForAllowance(amount)
      .then((_isAllowed: boolean) => { setIsAllowed(_isAllowed) })
      .catch((e: Error) => { alert(`Error checking for allowance ${JSON.stringify(e, null, 2)}`) })
      .finally(() => { setRefetch(false) })
  }, [renToken, refetch])

  return {
    isAllowed,
    checkForAllowance: () => { setRefetch(true) }
  }
}
