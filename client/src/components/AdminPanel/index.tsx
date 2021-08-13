import React, { FC, useContext, useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Box, Form, Input, Button } from 'rimble-ui'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

enum FieldNames {
  darknodeID = 'darknodeID',
  publicKey = 'publicKey',
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
  const { renPool, isLocked, refetchIsLocked } = useContext(RenPoolContext)

  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<InputFields>(defaultInputValues)
  const [disabled, setDisabled] = useState(false)

  const handleChange = async (e: ChangeEvent<HTMLInputElement>, fieldName: keyof typeof FieldNames): Promise<void> => {
    setInput({ ...input, [fieldName]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setDisabled(true)

    if (renPool == null) return

    if (Object.values(input).some(v => v.trim().lentgh === 0)) {
      alert(`Both ${FieldNames.darknodeID} and ${FieldNames.publicKey} are required`)
      setDisabled(false)
      return
    }

    try {
      const tx = await renPool.deposit(...Object.values(input), { gasLimit: 200000 })
      await tx.wait() // wait for mining
      setInput(defaultInputValues)
    } catch (e) {
      alert(`Could not deposit, ${JSON.stringify(e, null, 2)}`)
    }

    setDisabled(false)
  }

  return (
    <Form
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        value={input[FieldNames.darknodeID]}
        placeholder={FieldNames.darknodeID}
        disabled={disabled}
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
        disabled={disabled}
        width={1}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleChange(e, FieldNames.publicKey)
        }}
      />
      <Box p={2} />
      <Button
        type="submit"
        variant={isApproved ? 'success' : ''}
        disabled={disabled}
        width={1}
      >
        {isApproved ? 'Register' : 'Approve registration'}
      </Button>
    </Form>
  )
}
