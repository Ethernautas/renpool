import React, { FC, useState, useEffect, createContext } from 'react'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { CONTRACT_NAMES } from '../constants'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useContract } from '../hooks/useContract'

interface CtxValue {
  renPool: Contract | undefined
  totalPooled: BigNumber
  isLocked: boolean
  accountStaked: BigNumber
  refetchTotalPooled: () => Promise<void>
  refetchIsLocked: () => Promise<void>
  refetchAccountStaked: () => Promise<void>
}

/**
 * The defaultValue argument is ONLY used when a component does not have a matching
 * Provider above it in the tree. This can be helpful for testing components in isolation
 * without wrapping them. Note: passing undefined as a Provider value does not cause
 * consuming components to use defaultValue.
 */
const defaultValue: CtxValue = {
  renPool: undefined,
  totalPooled: BigNumber.from(0),
  isLocked: false,
  accountStaked: BigNumber.from(0),
  refetchTotalPooled: () => Promise.resolve(null),
  refetchIsLocked: () => Promise.resolve(null),
  refetchAccountStaked: () => Promise.resolve(null),
}

export const RenPoolContext = createContext<CtxValue>(defaultValue)

export const RenPoolProvider: FC = ({
  children,
}) => {
  const { account } = useActiveWeb3React()

  const renPool = useContract(CONTRACT_NAMES.RenPool)

  const [totalPooled, setTotalPooled] = useState<BigNumber>(BigNumber.from(0))
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [accountStaked, setAccountStaked] = useState<BigNumber>(BigNumber.from(0))

  const getTotalPooled = async (): Promise<void> => {
    try {
      const _totalPooled: BigNumber = await renPool.totalPooled({ gasLimit: 60000 })
      setTotalPooled(BigNumber.from(_totalPooled))
    } catch (e) {
      console.log(`Error querying totalPooled ${JSON.stringify(e, null, 2)}`)
    }
  }

  const getIsLocked = async (): Promise<void> => {
    try {
      const _isLocked: boolean = await renPool.isLocked({ gasLimit: 60000 })
      setIsLocked(_isLocked)
    } catch (e) {
      console.log(`Error querying isLocked ${JSON.stringify(e, null, 2)}`)
    }
  }

  const getBalanceOf = async (): Promise<void> => {
    try {
      const _staked: BigNumber = await renPool.balanceOf(account, { gasLimit: 60000 })
      setAccountStaked(_staked)
    } catch (e) {
      console.log(`Error querying balanceOf ${JSON.stringify(e, null, 2)}`)
    }
  }

  useEffect(() => {
    if (renPool != null) {
      getTotalPooled()
    }
  }, [renPool])

  useEffect(() => {
    if (renPool != null) {
      getIsLocked()
    }
  }, [renPool])

  useEffect(() => {
    if (renPool != null) {
      getBalanceOf()
    }
  }, [renPool])

  return (
    <RenPoolContext.Provider
      value={{
        renPool,
        totalPooled,
        isLocked,
        accountStaked,
        refetchTotalPooled: getTotalPooled,
        refetchIsLocked: getIsLocked,
        refetchAccountStaked: getBalanceOf,
      }}
    >
      {children}
    </RenPoolContext.Provider>
  )
}
