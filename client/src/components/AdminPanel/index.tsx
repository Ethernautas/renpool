import React, { FC, useContext } from 'react'
import { formatBytes32String } from '@ethersproject/strings'
import { Box, Flash, Button, Text } from 'rimble-ui'
import { BOND } from '../../constants'
import { darknodeIDBase58ToHex } from '../../utils/base58ToHex'
import { DarknodeParams } from '../../utils/darknodeUrl'
import { DarknodeRegistryContext } from '../../context/DarknodeRegistryProvider'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useRenAllowance } from '../../hooks/useRenAllowance'
import { useForm } from '../../hooks/useForm'
import { DarknoneUrlForm } from '../DarknodeUrlForm'

export const AdminPanel: FC = (): JSX.Element => {
  const { darknodeRegistry } = useContext(DarknodeRegistryContext)
  const { renPool, isLocked } = useContext(RenPoolContext)

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
    try {
      const tx = await renPool.registerDarknode(darknodeIDBase58ToHex(darknodeID), formatBytes32String(publicKey), { gasLimit: 20000000 })
      await tx.wait() // wait for mining
    } catch (e) {
      handleServerError(`Error during darknode registration, ${JSON.stringify(e, null, 2)}`)
    }
  }

  if (darknodeRegistry == null || renPool == null) {
    return <Text>Loading...</Text>
  }

  if (!isLocked) {
    return (
      <Box p={3}>
        <Flash my={3} variant="warning">
          Pool needs to be locked before registration
        </Flash>
      </Box>
    )
  }

  return (
    <>
      <Button
        disabled={disabled || isAllowed}
        onApprove={handleApprove}
        width={1}
      >
        Approve registration
      </Button>
      <Box p={2} />
      <DarknoneUrlForm
        btnLabel="Register darknode"
        disabled={disabled || !isAllowed}
        onBefore={handleBefore}
        onClientCancel={handleClientCancel}
        onClientError={handleClientError}
        onSuccess={async (darknodeParams: DarknodeParams) => {
          await handleRegister(darknodeParams)
          handleSuccess()
        }}
      />
    </>
  )
}
