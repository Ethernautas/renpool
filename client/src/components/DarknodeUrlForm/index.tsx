import React, { FC, useState, ChangeEvent, FormEvent } from 'react'
import { Box, Form, Button } from 'rimble-ui'
import { validDarknodeUrl, getDarknodeUrlParams } from '../../utils/darknodeUrl'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const DARKNODE_NETWORK = CHAIN_ID === '1' ? 'mainnet' : 'testnet'
const DARKNODE_BASE_URL = `https://${DARKNODE_NETWORK}.renproject.io/darknode/`
const DARKNODE_URL_PLACEHOLDER = `https://${DARKNODE_NETWORK}.renproject.io/darknode/<YOUR-DARKNODE-ID>?action=register&public_key=<YOUR-PUBLIC-KEY>&name=<YOUR-DARKNODE-NAME>`

export interface DarknodeUrlFormProps {
  btnLabel: string
  disabled: boolean
  onBeforeHook: () => void
  onClientCancelHook: () => void
  onClientErrorHook: (err?: string) => void
  onSuccessHook: ({ darknodeID, publicKey }: { darknodeID: string, publicKey: string }) => void
}

export const DarknoneUrlForm: FC<DarknodeUrlFormProps> = ({
  btnLabel,
  disabled,
  onBeforeHook,
  onClientCancelHook,
  onClientErrorHook,
  onSuccessHook,
}): JSX.Element => {
  const [darknodeUrl, setDarknodeUrl] = useState<string>('')

  const handleChange = async (e: ChangeEvent<HTMLTextAreaElement>): Promise<void> => {
    setDarknodeUrl(e.target.value || '')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // Run before hook logic if provided and return on error
    try {
      onBeforeHook()
    } catch (exc) {
      onClientCancelHook()
      return // return silently
    }

    // Validate input
    const { isValid, err } = validDarknodeUrl(darknodeUrl, DARKNODE_BASE_URL)

    // In case of errors, display on UI and return handler to parent component
    if (!isValid) {
      alert(`Invalid url. Reason: ${err}`)
      onClientErrorHook(err)
      return
    }

    // Get darknode params
    const { darknodeID, publicKey } = getDarknodeUrlParams(darknodeUrl, DARKNODE_BASE_URL)

    // Pass event up to parent component
    onSuccessHook({ darknodeID, publicKey })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <textarea
        value={darknodeUrl}
        placeholder={DARKNODE_URL_PLACEHOLDER}
        disabled={disabled}
        rows={13}
        style={{ width: '100%' }}
        onChange={handleChange}
      />
      <Box p={2} />
      <Button
        type="submit"
        variant="success"
        disabled={disabled}
        width={1}
      >
        {btnLabel}
      </Button>
    </Form>
  )
}
