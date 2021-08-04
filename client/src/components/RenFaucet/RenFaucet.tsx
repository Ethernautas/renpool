import React, { FC, useContext } from 'react'
import { Button } from 'rimble-ui'
import { RenTokenContext } from '../../context/RenTokenProvider'

export interface RenFaucetProps {
  disabled?: boolean
}

export const RenFaucet: FC<RenFaucetProps> = ({
  disabled = false,
}): JSX.Element => {
  const { renToken } = useContext(RenTokenContext)

  const handleClick = async () => {
    try {
      const tx = await renToken.callFaucet({ gasLimit: 60000 })
      await tx.wait() // wait for mining
    } catch (e) {
      alert(`Could not get from faucet ${JSON.stringify(e, null, 2)}`)
    }
  }

  return (
    <Button
      size="medium"
      disabled={disabled}
      width={1}
      onClick={handleClick}
    >
      Request assets
    </Button>
  )
}

