import React, { useContext }  from 'react'
import { Flash, Box, Text } from 'rimble-ui'
import { NETWORKS } from '../../constants'
import { RenPoolContext } from '../../context/RenPoolProvider'
import { useConnection } from '../../hooks/useConnection'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export const Banners = (): JSX.Element => {
  const { isAccountLocked, isWrongChain } = useConnection()
  const { isLocked } = useContext(RenPoolContext)

  return (
    <>
      {isAccountLocked && (
        <Box p={3}>
          <Flash my={3} variant="warning">
            Please, connect with MetaMask
          </Flash>
        </Box>
      )}

      {isWrongChain && (
        <Box p={3}>
          <Flash my={3} variant="warning">
            Please, switch network to <Text.span fontWeight={600}>{NETWORKS[CHAIN_ID]}</Text.span>
          </Flash>
        </Box>
      )}

      {isLocked && (
        <Box p={3}>
          <Flash my={3} variant="success">
            The pool is locked
          </Flash>
        </Box>
      )}
    </>
  )
}
