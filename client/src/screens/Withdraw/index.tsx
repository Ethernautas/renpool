import React, { FC, useContext } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Text } from 'rimble-ui'
import { useForm } from '../../hooks/useForm'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { AmountForm } from '../../components/AmountForm'

export const WithdrawScreen: FC = (): JSX.Element => {
  const {
    renPool,
    accountPooled,
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
    <AmountForm
      btnLabel="Withdraw"
      disabled={disabled}
      available={accountPooled}
      onBefore={handleBefore} // set 'disabled' to 'true'
      onClientCancel={handleClientCancel}
      onClientError={handleClientError}
      onSuccess={async (amount: BigNumber) => {
        await handleWithdraw(amount)
        handleSuccess() // cleanup (set 'disabled' to 'false')
      }}
    />
  )
}
