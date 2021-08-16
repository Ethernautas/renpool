import React, { FC, useContext, useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatBytes32String } from '@ethersproject/strings'
import { Box, Form, Input, Button } from 'rimble-ui'
import { BOND } from '../../constants'
import { DarknodeRegistryContext } from '../../context/DarknodeRegistryProvider'
import { RenTokenContext } from '../../context/RenTokenProvider'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

enum FieldNames {
  darknodeID = 'darknodeID',
  publicKey = 'publicKey',
}

enum Actions {
  APPROVE = 'APPROVE',
  REGISTER = 'REGISTER',
}

interface InputFields {
  [FieldNames.darknodeID]: string
  [FieldNames.publicKey]: string
}

const defaultInputValues = {
  [FieldNames.darknodeID]: '',
  [FieldNames.publicKey]: '',
}

export const AdminPanel: FC = (): JSX.Element => {
  const { account } = useActiveWeb3React()
  const { darknodeRegistry } = useContext(DarknodeRegistryContext)
  const { renToken } = useContext(RenTokenContext)
  const { renPool, isLocked, refetchIsLocked } = useContext(RenPoolContext)

  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<InputFields>(defaultInputValues)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (renToken != null && account != null) {
      checkForApproval(BOND)
        .then((_isApproved: boolean) => { setIsApproved(_isApproved) })
        .catch((e: Error) => { alert(`Error checking for approval ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renToken])

  const checkForApproval = async (value: BigNumber): Promise<boolean> => {
    if (renToken == null) return false
    if (value.lt(BigNumber.from(1))) return false
    const allowance: BigNumber = await renToken.allowance(renPool.address, darknodeRegistry.address)
    return allowance.sub(value).gte(BigNumber.from(0))
  }
  // TODO: after node registration, query status from DarknodeRegistry

  const handleChange = async (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: FieldNames
  ): Promise<void> => {
    setInput({ ...input, [fieldName]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: Actions): Promise<void> => {
    e.preventDefault()
    setDisabled(true)

    if (darknodeRegistry == null || renPool == null) return

    if (!isLocked) {
      alert('Pool needs to be full for the darknode to be registered')
      setDisabled(false)
      return
    }

    if (Object.values(input).some(v => v.trim().length === 0)) {
      alert(`Both ${FieldNames.darknodeID} and ${FieldNames.publicKey} are required`)
      setDisabled(false)
      return
    }

    if (action === Actions.APPROVE) {
      const tx = await renPool.approveBondTransfer({ gasLimit: 200000 })
      await tx.wait() // wait for mining
      const _isApproved = await checkForApproval(BOND)
      setIsApproved(_isApproved)
    }

    try {
      console.log('VALUES', input[FieldNames.darknodeID], input[FieldNames.publicKey])
      const tx = await renPool.registerDarknode(
        input[FieldNames.darknodeID],
        formatBytes32String(input[FieldNames.publicKey]),
        { gasLimit: 20000000 },
      )
      await tx.wait() // wait for mining
      setInput(defaultInputValues)
    } catch (e) {
      alert(`Could not register, ${JSON.stringify(e, null, 2)}`)
    }

    setDisabled(false)
  }

  const _disabled = !isLocked

  return (
    <Form
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        value={input[FieldNames.darknodeID]}
        placeholder={FieldNames.darknodeID}
        disabled={disabled || _disabled}
        width={1}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleChange(e, FieldNames.darknodeID)
        }}
      />
      <Box p={2} />
      <Input
        type="text"
        value={input[FieldNames.publicKey]}
        placeholder={FieldNames.publicKey}
        disabled={disabled || _disabled}
        width={1}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleChange(e, FieldNames.publicKey)
        }}
      />
      <Box p={2} />
      <Button
        type="submit"
        variant={isApproved ? 'success' : ''}
        disabled={disabled || _disabled}
        width={1}
      >
        {isApproved ? 'Register darknode' : 'Approve registration'}
      </Button>
    </Form>
  )
}
