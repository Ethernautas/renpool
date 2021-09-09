import React, { FC, useContext } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Text } from 'rimble-ui'
import { MAX_UINT256 } from '../../constants'
import { RenTokenContext } from '../../context/RenTokenProvider'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useConnection } from '../../hooks/useConnection'
import { useForm } from '../../hooks/useForm'
import { useRenAllowance } from '../../hooks/useRenAllowance'
import { ScreenLayout } from '../../layouts/ScreenLayout'
import { AmountForm } from '../../components/AmountForm'

export const DepositScreen: FC = (): JSX.Element => {
  const { renToken, accountBalance } = useContext(RenTokenContext)
  const {
    renPool,
    refetchTotalPooled,
    refetchIsLocked,
    refetchAccountPooled,
  } = useContext(RenPoolContext)

  const { account } = useActiveWeb3React()
  const { isAccountLocked, isWrongChain } = useConnection()
  const { isAllowed, checkForAllowance } = useRenAllowance(account, renPool?.address, MAX_UINT256)
  const {
    disabled,
    handleBefore,
    handleClientCancel,
    handleClientError,
    handleServerError,
    handleSuccess,
  } = useForm(true)

  const handleApprove = async (): Promise<void> => {
    try {
      const tx = await renToken.approve(renPool.address, MAX_UINT256)
      await tx.wait() // wait for mining
      checkForAllowance() // this will update 'isAllowed' state
    } catch (e) {
      handleServerError(`Error during deposit approval, ${JSON.stringify(e, null, 2)}`)
    }
  }

  const handleDeposit = async (amount: BigNumber): Promise<void> => {
    if (!isAllowed) {
      handleClientError('Please, approve transaction first.',)
      return
    }

    try {
      const tx = await renPool.deposit(amount, { gasLimit: 200000 })
      await tx.wait() // wait for mining
      await Promise.all([
        refetchTotalPooled,
        refetchIsLocked,
        refetchAccountPooled,
      ])
    } catch (e) {
      alert(`Error during deposit, ${JSON.stringify(e, null, 2)}`)
    }
  }

  if (renPool == null) {
    return <Text>Loading...</Text>
  }

  return (
    <ScreenLayout title="Deposit REN">
      <AmountForm
        btnLabel={!isAllowed ? 'Approve' : 'Deposit'}
        btnVariant={!isAllowed ? 'default' : 'success'}
        disabled={disabled || isAccountLocked || isWrongChain}
        upperBound={accountBalance}
        onBefore={handleBefore} // set 'disabled' to 'true', clean any messages, etc
        onClientCancel={handleClientCancel}
        onClientError={handleClientError}
        onSuccess={async (amount: BigNumber) => {
          if (!isAllowed) {
            await handleApprove()
          } else {
            await handleDeposit(amount)
          }
          handleSuccess() // cleanup (set 'disabled' to 'false')
        }}
      />
    </ScreenLayout>
  )
}
