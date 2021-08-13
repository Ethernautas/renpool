import React, { useContext } from 'react'
import { Text, Link } from 'rimble-ui'
import { ETHERSCAN } from '../../constants'
import { linkTheme } from '../../theme'
import { RenTokenContext } from '../../context/RenTokenProvider'
import { RenPoolContext } from '../../context/RenPoolProvider'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const linkProps = {
  ...linkTheme,
  target: 'blank',
  style: {
    wordBreak: 'break-all',
  },
}

export const Addresses = (): JSX.Element => {
  const { renToken } = useContext(RenTokenContext)
  const { renPool, owner, admin } = useContext(RenPoolContext)

  const etherscan = ETHERSCAN[CHAIN_ID]

  return (
    <>
      <Text.p>RenToken: <Link href={`${etherscan}${renToken?.address || ''}`} {...linkProps}>{renToken?.address || ''}</Link></Text.p>
      <Text.p>RenPool: <Link href={`${etherscan}${renPool?.address || ''}`} {...linkProps}>{renPool?.address || ''}</Link></Text.p>
      <Text.p>Owner: <Link href={`${etherscan}${owner || ''}`} {...linkProps}>{owner || ''}</Link></Text.p>
      <Text.p>Admin: <Link href={`${etherscan}${admin || ''}`} {...linkProps}>{admin || ''}</Link></Text.p>
    </>
  )
}
