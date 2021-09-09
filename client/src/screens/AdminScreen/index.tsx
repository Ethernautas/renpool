import React, { FC, useContext } from 'react'
import { formatBytes32String } from '@ethersproject/strings'
import { Box, Flash, Text } from 'rimble-ui'
import { BOND } from '../../constants'
import { darknodeIDBase58ToHex } from '../../utils/base58ToHex'
import { DarknodeRegistryContext } from '../../context/DarknodeRegistryProvider'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useConnection } from '../../hooks/useConnection'
import { useRenAllowance } from '../../hooks/useRenAllowance'
import { useForm } from '../../hooks/useForm'
import { ScreenLayout } from '../../layouts/ScreenLayout'
import { DarknoneUrlForm, DarknodeParams } from '../../components/DarknodeUrlForm'

export const AdminScreen: FC = (): JSX.Element => {
  const { darknodeRegistry } = useContext(DarknodeRegistryContext)
  const { renPool, isLocked } = useContext(RenPoolContext)

  const { isAccountLocked, isWrongChain } = useConnection()
  const { isAllowed, checkForAllowance } = useRenAllowance(renPool?.address, darknodeRegistry?.address, BOND)
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
      const tx = await renPool.approveBondTransfer({ gasLimit: 200000 })
      await tx.wait() // wait for mining
      checkForAllowance() // this will update 'isAllowed' state
    } catch (e) {
      handleServerError(`Error during bond approval, ${JSON.stringify(e, null, 2)}`)
    }
  }

  const handleRegister = async ({ darknodeID, publicKey }: DarknodeParams): Promise<void> => {
    if (!isAllowed) {
      handleClientError('Please, approve transaction first.',)
      return
    }

    try {
      const tx = await renPool.registerDarknode(darknodeIDBase58ToHex(darknodeID), formatBytes32String(publicKey), { gasLimit: 20000000 })
      await tx.wait() // wait for mining
    } catch (e) {
      handleServerError(`Error during darknode registration, ${JSON.stringify(e, null, 2)}`)
    }
  }

  // if (darknodeRegistry == null || renPool == null) {
  if (renPool == null) {
    return <Text>Loading...</Text>
  }

  return (
    <ScreenLayout title="Admin Panel">
      {!isLocked && (
        <>
          <Flash my={3} variant="warning">
            Pool needs to be locked for the darknode to be registered
          </Flash>
          <Box p={2} />
        </>
      )}
      <DarknoneUrlForm
        btnLabel={!isAllowed ? 'Approve registration' : 'Register darknode'}
        btnVariant={!isAllowed ? 'default' : 'success'}
        disabled={disabled || !isLocked || isAccountLocked || isWrongChain}
        onBefore={handleBefore} // set 'disabled' to 'true', clean error messages, ...
        onClientCancel={handleClientCancel}
        onClientError={handleClientError}
        onSuccess={async (darknodeParams: DarknodeParams) => {
          if (!isAllowed) {
            await handleApprove()
          } else {
            await handleRegister(darknodeParams)
          }
          handleSuccess() // cleanup (set 'disabled' to 'false')
        }}
      />
    </ScreenLayout>
  )
}
