import React, { FC } from 'react'
import { Text, Link } from 'rimble-ui'
import { formatUnits } from '@ethersproject/units'
import { NETWORKS, FAUCETS, FAUCET_AMOUNT, BOND, DECIMALS } from '../../constants'
import { linkTheme } from '../../theme'
import { RenFaucet } from '../RenFaucet'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const REN_FAUCET_LINK = 'https://forum.renproject.io/t/is-there-any-ren-faucet-on-kovan/904/3'

export interface InstructionsProps {
  disabled?: boolean
}

export const Instructions: FC<InstructionsProps> = ({
  disabled = false,
}): JSX.Element => {
  const networkName = NETWORKS[CHAIN_ID]
  const faucet = FAUCETS[CHAIN_ID]

  return (
    <>
      <Text.p>
          1. Connect your MetaMask to the <Text.span fontWeight="bold">{networkName}</Text.span> network.
      </Text.p>
      <Text.p>
          2. Head over <Link target="_blank" rel="noreferrer" href={faucet} {...linkTheme}>{faucet}</Link>
          &nbsp;and get some test ETH to pay for transactions.
      </Text.p>
      {CHAIN_ID === '1337' ? (
        <>
          <Text.p>
              3. Get {parseInt(formatUnits(FAUCET_AMOUNT, DECIMALS), 10)} REN tokens by pressing the button below.
              To verify that the tokens are in your wallet, switch to the <Text.span fontWeight="bold">Assets</Text.span> tab in your MetaMask and press the <Text.span fontWeight="bold">Add Tokens</Text.span> button.
              Paste the address of the RenToken contract above.
          </Text.p>
          <RenFaucet disabled={disabled} />
        </>
      ) : (
        <Text.p>
          3. Request some REN test tokens from the ren protocol. See <a target="_blank" rel="noreferrer" href={REN_FAUCET_LINK}>{REN_FAUCET_LINK}</a>.
          To verify that the tokens are in your wallet, switch to the <Text.span fontWeight="bold">Assets</Text.span> tab in your MetaMask and press the <Text.span fontWeight="bold">Add Tokens</Text.span> button.
          Paste the address of the RenToken contract above.
        </Text.p>
      )}
      <Text.p>
          4. Enter the amount of REN you would like to deposit in the form above and hit the <Text.span fontWeight="bold">Approve</Text.span> button (this is only required for the first time).
          After the transaction is approved, you will be able to <Text.span fontWeight="bold">Deposit</Text.span> the desired amount of REN until the {parseInt(formatUnits(BOND, DECIMALS), 10)} target is reached.
          Once the pool is full, we lock deposits and withdraws and transfer the tokens to the REN protocol to spin up a new Darknode instance.
        {/* You can find more info on how the Dark node is setup in the following link <a href="">TODO</a>. */}
      </Text.p>
      <Text.p></Text.p>
      <Text.p>5. You can withdraw all the funds at any time as long as the pool hasn&apos;t been locked.</Text.p>
      <Text.p>6. Claim rewards TODO</Text.p>
    </>
  )
}
