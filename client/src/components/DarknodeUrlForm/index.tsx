import React, { FC, useState, ChangeEvent, FormEvent } from 'react'
import { Box, Form, Button } from 'rimble-ui'
import { validDarknodeUrl, getDarknodeUrlParams, DarknodeParams } from '../../utils/darknodeUrl'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const DARKNODE_NETWORK = CHAIN_ID === '1' ? 'mainnet' : 'testnet'
const DARKNODE_BASE_URL = `https://${DARKNODE_NETWORK}.renproject.io/darknode/`
const DARKNODE_URL_PLACEHOLDER = `https://${DARKNODE_NETWORK}.renproject.io/darknode/<YOUR-DARKNODE-ID>?action=register&public_key=<YOUR-PUBLIC-KEY>&name=<YOUR-DARKNODE-NAME>`

export interface DarknodeUrlFormProps {
  btnLabel: string
  disabled: boolean
  onBefore?: () => void
  onClientCancel?: () => void
  onClientError?: (err?: string) => void
  onSuccess?: ({ darknodeID, publicKey }: DarknodeParams) => void
}

export const DarknoneUrlForm: FC<DarknodeUrlFormProps> = ({
  btnLabel,
  disabled,
  onBefore = () => null,
  onClientCancel = () => null,
  onClientError = () => null,
  onSuccess = () => null,
}): JSX.Element => {
  const [darknodeUrl, setDarknodeUrl] = useState<string>('')

  const handleChange = async (e: ChangeEvent<HTMLTextAreaElement>): Promise<void> => {
    setDarknodeUrl(e.target.value || '')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // Run 'before' logic if provided and return on error
    try {
      onBefore()
    } catch (e) {
      onClientCancel()
      return // return silently
    }

    // Validate input
    const { isValid, err } = validDarknodeUrl(darknodeUrl, DARKNODE_BASE_URL)

    // In case of errors, display on UI and return handler to parent component
    if (!isValid) {
      alert(`Invalid url. Reason: ${err}`)
      onClientError(err)
      return
    }

    // Get darknode params
    const { darknodeID, publicKey } = getDarknodeUrlParams(darknodeUrl, DARKNODE_BASE_URL)

    // Pass event up to parent component
    onSuccess({ darknodeID, publicKey })
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
