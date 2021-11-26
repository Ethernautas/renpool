import React, { FC, useState, useEffect, createContext } from 'react'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { ContractNames, CONTRACT_ADDRESSES } from '../constants'
import { RenPool as artifact} from 'renpool-contracts'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useContract } from '../hooks/useContract'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

interface CtxValue {
  renPool: Contract | undefined
  owner: string | null
  nodeOperator: string | null
  totalPooled: BigNumber
  isLocked: boolean
  accountPooled: BigNumber
  refetchTotalPooled: () => Promise<void>
  refetchIsLocked: () => Promise<void>
  refetchAccountPooled: () => Promise<void>
}

/**
 * The defaultValue argument is ONLY used when a component does not have a matching
 * Provider above it in the tree. This can be helpful for testing components in isolation
 * without wrapping them. Note: passing undefined as a Provider value does not cause
 * consuming components to use defaultValue.
 */
const defaultValue: CtxValue = {
  renPool: undefined,
  owner: null,
  nodeOperator: null,
  totalPooled: BigNumber.from(0),
  isLocked: false,
  accountPooled: BigNumber.from(0),
  refetchTotalPooled: () => Promise.resolve(null),
  refetchIsLocked: () => Promise.resolve(null),
  refetchAccountPooled: () => Promise.resolve(null),
}

export const RenPoolContext = createContext<CtxValue>(defaultValue)

export const RenPoolProvider: FC = ({
  children,
}) => {
  const { account } = useActiveWeb3React()

  // let address
  // let artifact: { abi: ContractInterface }

  // try {
  //   address = CONTRACT_ADDRESSES[CHAIN_ID].REN_POOL
  //   artifact = require(`../artifacts/deployments/${CHAIN_ID}/${address}.json`)
  // } catch (e) {
  //   alert(`Could not load contract ${ContractNames.RenPool}, ${JSON.stringify(e, null, 2)}`)
  //   return null
  // }

  const renPool = useContract(CONTRACT_ADDRESSES[CHAIN_ID].REN_POOL, artifact.abi)

  const [owner, setOwner] = useState<string | null>(null)
  const [nodeOperator, setNodeOperator] = useState<string | null>(null)
  const [totalPooled, setTotalPooled] = useState<BigNumber>(BigNumber.from(0))
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [accountPooled, setAccountPooled] = useState<BigNumber>(BigNumber.from(0))

  const getOwner = async (): Promise<void> => {
    if (renPool == null) return

    try {
      const _owner: string = await renPool.owner({ gasLimit: 60000 })
      setOwner(_owner)
    } catch (e) {
      console.log(`Error querying owner ${JSON.stringify(e, null, 2)}`)
    }
  }

  const getNodeOperator = async (): Promise<void> => {
    if (renPool == null) return

    try {
      const _nodeOperator: string = await renPool.nodeOperator({ gasLimit: 60000 })
      setNodeOperator(_nodeOperator)
    } catch (e) {
      console.log(`Error querying nodeOperator ${JSON.stringify(e, null, 2)}`)
    }
  }

  const getTotalPooled = async (): Promise<void> => {
    if (renPool == null) return

    try {
      const _totalPooled: BigNumber = await renPool.totalPooled({ gasLimit: 60000 })
      setTotalPooled(BigNumber.from(_totalPooled))
    } catch (e) {
      console.log(`Error querying totalPooled ${JSON.stringify(e, null, 2)}`)
    }
  }

  const getIsLocked = async (): Promise<void> => {
    if (renPool == null) return

    try {
      const _isLocked: boolean = await renPool.isLocked({ gasLimit: 60000 })
      setIsLocked(_isLocked)
    } catch (e) {
      console.log(`Error querying isLocked ${JSON.stringify(e, null, 2)}`)
    }
  }

  const getBalanceOf = async (): Promise<void> => {
    if (renPool == null || account == null) return

    try {
      const _pooled: BigNumber = await renPool.balanceOf(account, { gasLimit: 60000 })
      setAccountPooled(_pooled)
    } catch (e) {
      console.log(`Error querying balanceOf ${JSON.stringify(e, null, 2)}`)
    }
  }

  useEffect(() => {
    getOwner()
    getNodeOperator()
    getTotalPooled()
    getIsLocked()
    getBalanceOf()
  }, [renPool])

  return (
    <RenPoolContext.Provider
      value={{
        renPool,
        owner,
        nodeOperator,
        totalPooled,
        isLocked,
        accountPooled,
        refetchTotalPooled: getTotalPooled,
        refetchIsLocked: getIsLocked,
        refetchAccountPooled: getBalanceOf,
      }}
    >
      {children}
    </RenPoolContext.Provider>
  )
}
