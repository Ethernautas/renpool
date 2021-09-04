import React, { FC, useContext, useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatBytes32String } from '@ethersproject/strings'
import { Box, Form, Button } from 'rimble-ui'
import { BOND } from '../../constants'
import { darknodeIDBase58ToHex } from '../../utils/base58ToHex'
import { DarknodeRegistryContext } from '../../context/DarknodeRegistryProvider'
import { RenTokenContext } from '../../context/RenTokenProvider'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { validDarknodeUrl, getDarknodeUrlParams } from '../../utils/darknodeUrl'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const DARKNODE_NETWORK = CHAIN_ID === '1' ? 'mainnet' : 'testnet'
const DARKNODE_BASE_URL = `https://${DARKNODE_NETWORK}.renproject.io/darknode/`
const DARKNODE_URL_PLACEHOLDER = `https://${DARKNODE_NETWORK}.renproject.io/darknode/<YOUR-DARKNODE-ID>?action=register&public_key=<YOUR-PUBLIC-KEY>&name=<YOUR-DARKNODE-NAME>`

enum Actions {
  APPROVE = 'APPROVE',
  REGISTER = 'REGISTER',
}

export interface DarknodeUrlFormProps {
  btnLabel: string
  disabled: boolean
  onBeforeHook: () => void
  onClientCancelHook: () => void
  onClientErrorHook: (err?: string) => void
  onSuccessHook: ({ darknodeID: string, publicKey: string, action: Actions }) => void
  // onApprove: () => void
  // onRegister: () => void
}

export const DarknoneUrlForm: FC<DarknodeUrlFormProps> = ({
  btnLabel,
  disabled,
  onBeforeHook,
  onClientCancelHook,
  onClientErrorHook,
  onSuccessHook,
  // onApprove,
  // onRegister,
}): JSX.Element => {
  // const { account } = useActiveWeb3React()
  // const { darknodeRegistry } = useContext(DarknodeRegistryContext)
  // const { renToken } = useContext(RenTokenContext)
  // const { renPool, isLocked } = useContext(RenPoolContext)

  // const [isApproved, setIsApproved] = useState(false)
  const [darknodeUrl, setDarknodeUrl] = useState<string>('')

  // useEffect(() => {
  //   if (renToken != null && account != null) {
  //     checkForApproval(BOND)
  //       .then((_isApproved: boolean) => { setIsApproved(_isApproved) })
  //       .catch((e: Error) => { alert(`Error checking for approval ${JSON.stringify(e, null, 2)}`) })
  //   }
  // }, [renToken])

  // const checkForApproval = async (value: BigNumber): Promise<boolean> => {
  //   if (renToken == null || darknodeRegistry == null) return false
  //   if (value.lt(BigNumber.from(1))) return false
  //   const allowance: BigNumber = await renToken.allowance(renPool.address, darknodeRegistry.address)
  //   return allowance.sub(value).gte(BigNumber.from(0))
  // }

  // TODO: after node registration, query status from DarknodeRegistry





  const handleChange = async (e: ChangeEvent<HTMLTextAreaElement>): Promise<void> => {
    setDarknodeUrl(e.target.value || '')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: Actions): Promise<void> => {
    e.preventDefault()

    // Run before hook logic if provided and return on error
    try {
      onBeforeHook()
    } catch (exc) {
      onClientCancelHook()
      return // return silently
    }

    // Validate fields
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
    onSuccessHook({ darknodeID, publicKey, action })

    // if (action === Actions.APPROVE) {
    //   const tx = await renPool.approveBondTransfer({ gasLimit: 200000 })
    //   await tx.wait() // wait for mining
    //   const _isApproved = await checkForApproval(BOND)
    //   setIsApproved(_isApproved)
    // }

    // try {
    //   const { darknodeID, publicKey } = getDarknodeUrlParams(darknodeUrl, DARKNODE_BASE_URL)
    //   console.log('DARKNODE_ID', darknodeID, 'PUBLIC_KEY', publicKey)
    //   const tx = await renPool.registerDarknode(darknodeIDBase58ToHex(darknodeID), formatBytes32String(publicKey), { gasLimit: 20000000 })
    //   await tx.wait() // wait for mining
    //   setDarknodeUrl('')
    // } catch (e) {
    //   alert(`Could not register, ${JSON.stringify(e, null, 2)}`)
    // }

    // setDisabled(false)
  }

  const _disabled = !isLocked

  return (
    <Form
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        handleSubmit(e, isApproved ? Actions.REGISTER : Actions.APPROVE)
      }}
    >
      <textarea
        value={darknodeUrl}
        placeholder={DARKNODE_URL_PLACEHOLDER}
        disabled={disabled || _disabled}
        rows={13}
        style={{ width: '100%' }}
        onChange={handleChange}
      />
      <Box p={2} />
      <Button
        type="submit"
        variant={isApproved ? 'success' : ''}
        disabled={disabled || _disabled}
        width={1}
      >
        {/* {isApproved ? 'Register darknode' : 'Approve registration'} */}
        {btnLabel}
      </Button>
    </Form>
  )
}
