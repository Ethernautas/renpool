import React, { FC, useContext } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Text } from 'rimble-ui'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useConnection } from '../../hooks/useConnection'
import { useForm } from '../../hooks/useForm'
import { ScreenLayout } from '../../layouts/ScreenLayout'
import { AmountForm } from '../../components/AmountForm'

export const WithdrawScreen: FC = (): JSX.Element => {
  const {
    renPool,
    accountPooled,
    isLocked,
    refetchTotalPooled,
    refetchAccountPooled,
  } = useContext(RenPoolContext)

  const {
    disabled,
    handleBefore,
    handleClientCancel,
    handleClientError,
    handleServerError,
    handleSuccess,
  } = useForm(true)

  const { isAccountLocked, isWrongChain } = useConnection()

  const handleWithdraw = async (amount: BigNumber): Promise<void> => {
    try {
      const tx = await renPool.withdraw(amount, { gasLimit: 200000 })
      await tx.wait() // wait for mining
      await refetchTotalPooled()
      await refetchAccountPooled()
    } catch (e) {
      handleServerError(`Error during withdrawal, ${JSON.stringify(e, null, 2)}`)
    }
  }

  if (renPool == null) {
    return <Text>Loading...</Text>
  }

  return (
    <ScreenLayout title="Withdraw REN">
      <AmountForm
        btnLabel="Withdraw"
        btnVariant="danger"
        disabled={disabled || isAccountLocked || isWrongChain || isLocked}
        upperBound={accountPooled}
        onBefore={handleBefore} // set 'disabled' to 'true'
        onClientCancel={handleClientCancel}
        onClientError={handleClientError}
        onSuccess={async (amount: BigNumber) => {
          await handleWithdraw(amount)
          handleSuccess() // cleanup (set 'disabled' to 'false')
        }}
      />
    </ScreenLayout>
  )
}
