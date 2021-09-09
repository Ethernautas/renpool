import React, { FC, useState, ChangeEvent, FormEvent } from 'react'
import { Box, Form, Button } from 'rimble-ui'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const DARKNODE_NETWORK = CHAIN_ID === '1' ? 'mainnet' : 'testnet'
const DARKNODE_BASE_URL = `https://${DARKNODE_NETWORK}.renproject.io/darknode/`
const DARKNODE_URL_PLACEHOLDER = `https://${DARKNODE_NETWORK}.renproject.io/darknode/<YOUR-DARKNODE-ID>?action=register&public_key=<YOUR-PUBLIC-KEY>&name=<YOUR-DARKNODE-NAME>`

enum ErrorMessages {
  EMPTY_STRING = 'EMPTY_STRING',
  START_WITH = 'START_WITH',
  ACTION = 'ACTION',
  PUBLIC_KEY = 'PUBLIC_KEY',
  NAME = 'NAME',
}

export interface Props {
  btnLabel: string
  disabled: boolean
  onBefore?: () => void
  onClientCancel?: () => void
  onClientError?: (err?: string) => void
  onSuccess?: ({ darknodeID, publicKey }: DarknodeParams) => void
}

export interface DarknodeParams {
  darknodeID: string
  publicKey: string
}

export const DarknoneUrlForm: FC<Props> = ({
  btnLabel,
  disabled,
  onBefore = () => null,
  onClientCancel = () => null,
  onClientError = () => null,
  onSuccess = () => null,
}): JSX.Element => {
  const [darknodeUrl, setDarknodeUrl] = useState<string>('')

  const validateDarknodeUrl = (url: string): { isValid: boolean, err: string | null } => {
    if (url.trim().length === 0) {
      return { isValid: false, err: ErrorMessages.EMPTY_STRING }
    }
    if (!url.startsWith(DARKNODE_BASE_URL)) {
      return { isValid: false, err: ErrorMessages.START_WITH }
    }
    if (!url.includes('action=register')) {
      return { isValid: false, err: ErrorMessages.ACTION }
    }
    if (!url.includes('&public_key=0x')) {
      return { isValid: false, err: ErrorMessages.PUBLIC_KEY }
    }
    if (!url.includes('&name=')) {
      return { isValid: false, err: ErrorMessages.NAME }
    }
    return { isValid: true, err: null }
  }

  const getDarknodeUrlParams = (url: string): DarknodeParams => {
    const darknodeID = url.slice(DARKNODE_BASE_URL.length).split('?')[0] // base58

    const p1 = 'public_key='
    const p2 = '&name='
    const index1 = url.indexOf(p1)
    const index2 = url.indexOf(p2)
    const publicKey = url.slice(index1 + p1.length, index2)

    return { darknodeID, publicKey }
  }

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
    const { isValid, err } = validateDarknodeUrl(darknodeUrl)

    // In case of errors, display on UI and return handler to parent component
    if (!isValid) {
      onClientError(`Invalid url. Reason: ${err}`)
      return
    }

    // Get darknode params
    const { darknodeID, publicKey } = getDarknodeUrlParams(darknodeUrl)

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
