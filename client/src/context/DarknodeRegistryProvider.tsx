
import React, { FC, useState, useEffect, createContext } from 'react'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { CONTRACT_ADDRESSES } from '../constants'
import { IDarknodeRegistry as artifact} from'renpool-contracts'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useContract } from '../hooks/useContract'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

interface CtxValue {
  darknodeRegistry: Contract | undefined
//   owner: string | null
//   admin: string | null
//   totalPooled: BigNumber
//   isLocked: boolean
//   accountPooled: BigNumber
//   refetchTotalPooled: () => Promise<void>
//   refetchIsLocked: () => Promise<void>
//   refetchAccountPooled: () => Promise<void>
}

/**
 * The defaultValue argument is ONLY used when a component does not have a matching
 * Provider above it in the tree. This can be helpful for testing components in isolation
 * without wrapping them. Note: passing undefined as a Provider value does not cause
 * consuming components to use defaultValue.
 */
const defaultValue: CtxValue = {
  darknodeRegistry: undefined,
//   owner: null,
//   admin: null,
//   totalPooled: BigNumber.from(0),
//   isLocked: false,
//   accountPooled: BigNumber.from(0),
//   refetchTotalPooled: () => Promise.resolve(null),
//   refetchIsLocked: () => Promise.resolve(null),
//   refetchAccountPooled: () => Promise.resolve(null),
}

export const DarknodeRegistryContext = createContext<CtxValue>(defaultValue)

export const DarknodeRegistryProvider: FC = ({
  children,
}) => {
  // const { account } = useActiveWeb3React()

  const darknodeRegistry = CHAIN_ID !== '1337'
    ? useContract(CONTRACT_ADDRESSES[CHAIN_ID].DARKNODE_REGISTRY, artifact.abi)
    : undefined

  // const [owner, setOwner] = useState<string | null>(null)
  // const [admin, setAdmin] = useState<string | null>(null)
  // const [totalPooled, setTotalPooled] = useState<BigNumber>(BigNumber.from(0))
  // const [isLocked, setIsLocked] = useState<boolean>(false)
  // const [accountPooled, setAccountPooled] = useState<BigNumber>(BigNumber.from(0))

  // const getOwner = async (): Promise<void> => {
  //   if (darknodeRegistry == null) return

  //   try {
  //     const _owner: string = await darknodeRegistry.owner({ gasLimit: 60000 })
  //     setOwner(_owner)
  //   } catch (e) {
  //     console.log(`Error querying owner ${JSON.stringify(e, null, 2)}`)
  //   }
  // }

  // const getAdmin = async (): Promise<void> => {
  //   if (darknodeRegistry == null) return

  //   try {
  //     const _admin: string = await darknodeRegistry.admin({ gasLimit: 60000 })
  //     setAdmin(_admin)
  //   } catch (e) {
  //     console.log(`Error querying admin ${JSON.stringify(e, null, 2)}`)
  //   }
  // }

  // const getTotalPooled = async (): Promise<void> => {
  //   if (darknodeRegistry == null) return

  //   try {
  //     const _totalPooled: BigNumber = await darknodeRegistry.totalPooled({ gasLimit: 60000 })
  //     setTotalPooled(BigNumber.from(_totalPooled))
  //   } catch (e) {
  //     console.log(`Error querying totalPooled ${JSON.stringify(e, null, 2)}`)
  //   }
  // }

  // const getIsLocked = async (): Promise<void> => {
  //   if (darknodeRegistry == null) return

  //   try {
  //     const _isLocked: boolean = await darknodeRegistry.isLocked({ gasLimit: 60000 })
  //     setIsLocked(_isLocked)
  //   } catch (e) {
  //     console.log(`Error querying isLocked ${JSON.stringify(e, null, 2)}`)
  //   }
  // }

  // const getBalanceOf = async (): Promise<void> => {
  //   if (darknodeRegistry == null) return

  //   try {
  //     const _pooled: BigNumber = await darknodeRegistry.balanceOf(account, { gasLimit: 60000 })
  //     setAccountPooled(_pooled)
  //   } catch (e) {
  //     console.log(`Error querying balanceOf ${JSON.stringify(e, null, 2)}`)
  //   }
  // }

  // useEffect(() => {
  //   getOwner()
  //   getAdmin()
  //   getTotalPooled()
  //   getIsLocked()
  //   getBalanceOf()
  // }, [darknodeRegistry])

  return (
    <DarknodeRegistryContext.Provider
      value={{
        darknodeRegistry,
        // owner,
        // admin,
        // totalPooled,
        // isLocked,
        // accountPooled,
        // refetchTotalPooled: getTotalPooled,
        // refetchIsLocked: getIsLocked,
        // refetchAccountPooled: getBalanceOf,
      }}
    >
      {children}
    </DarknodeRegistryContext.Provider>
  )
}
