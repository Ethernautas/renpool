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

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const DARKNODE_NETWORK = CHAIN_ID === '1' ? 'mainnet' : 'testnet'
const DARKNODE_BASE_URL = `https://${DARKNODE_NETWORK}.renproject.io/darknode/`
const DARKNODE_URL_PLACEHOLDER = `https://${DARKNODE_NETWORK}.renproject.io/darknode/<YOUR-DARKNODE-ID>?action=register&public_key=<YOUR-PUBLIC-KEY>&name=<YOUR-DARKNODE-NAME>`

enum Actions {
  APPROVE = 'APPROVE',
  REGISTER = 'REGISTER',
}

interface DarknodeParams {
  darknodeID: string
  publicKey: string
}

export const AdminPanel: FC = (): JSX.Element => {
  const { account } = useActiveWeb3React()
  const { darknodeRegistry } = useContext(DarknodeRegistryContext)
  const { renToken } = useContext(RenTokenContext)
  const { renPool, isLocked } = useContext(RenPoolContext)

  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<string>('')
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (renToken != null && account != null) {
      checkForApproval(BOND)
        .then((_isApproved: boolean) => { setIsApproved(_isApproved) })
        .catch((e: Error) => { alert(`Error checking for approval ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renToken])

  const checkForApproval = async (value: BigNumber): Promise<boolean> => {
    if (renToken == null || darknodeRegistry == null) return false
    if (value.lt(BigNumber.from(1))) return false
    const allowance: BigNumber = await renToken.allowance(renPool.address, darknodeRegistry.address)
    return allowance.sub(value).gte(BigNumber.from(0))
  }

  // TODO: after node registration, query status from DarknodeRegistry

  const validUrl = (url: string): boolean => {
    console.log('URL', url)
    if (url.trim().length === 0) {
      console.log('length = 0')
      return false
    }
    if (!url.startsWith(DARKNODE_BASE_URL)) {
      console.log('START', DARKNODE_BASE_URL)
      return false
    }
    if (!url.includes('action=register&public_key=0x')) {
      console.log('PUBLIC_KEY')
      return false
    }
    if (!url.includes('&name=')) {
      console.log('NAME')
      return false
    }
    return true
  }

  const getDarknodeParams = (url: string): DarknodeParams => {
    const darknodeID = url.slice(DARKNODE_BASE_URL.length).split('?')[0] // base58

    const p1 = 'public_key='
    const p2 = '&name='
    const index1 = url.indexOf(p1)
    const index2 = url.indexOf(p2)
    const publicKey = url.slice(index1 + p1.length, index2)
    console.log('DARKNODE_ID', darknodeID, 'PUBLIC_KEY', publicKey)

    return { darknodeID, publicKey }
  }

  const handleChange = async (e: ChangeEvent<HTMLTextAreaElement>): Promise<void> => {
    setInput(e.target.value || '')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: Actions): Promise<void> => {
    e.preventDefault()
    setDisabled(true)

    // if (darknodeRegistry == null || renPool == null) return
    if (renPool == null) return

    if (!isLocked) {
      alert('Pool needs to be full for the darknode to be registered')
      setDisabled(false)
      return
    }

    if (!validUrl(input)) {
      alert('Invalid url')
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
      const { darknodeID, publicKey } = getDarknodeParams(input)
      const tx = await renPool.registerDarknode(darknodeIDBase58ToHex(darknodeID), formatBytes32String(publicKey), { gasLimit: 20000000 })
      await tx.wait() // wait for mining
      setInput('')
    } catch (e) {
      alert(`Could not register, ${JSON.stringify(e, null, 2)}`)
    }

    setDisabled(false)
  }

  const _disabled = !isLocked

  return (
    <Form
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        handleSubmit(e, isApproved ? Actions.REGISTER : Actions.APPROVE)
      }}
    >
      <textarea
        value={input}
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
        {isApproved ? 'Register darknode' : 'Approve registration'}
      </Button>
    </Form>
  )
}
