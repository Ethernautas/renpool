import React from 'react'
import { Text, Link } from 'rimble-ui'
import { NETWORKS, CONTRACT_NAMES, FAUCETS, ETHERSCAN } from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useContract } from '../../hooks/useContract'
import { RenFaucet } from '../RenFaucet'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export const Instructions = (): JSX.Element => {
  const { chainId, account } = useActiveWeb3React()
  const renToken = useContract(CONTRACT_NAMES.RenToken)

  const isAccountsUnlocked = account != null
  const wrongChain = chainId != parseInt(CHAIN_ID, 10)

  const networkName = NETWORKS[CHAIN_ID]
  const faucet = FAUCETS[CHAIN_ID]
  const etherscan = `${ETHERSCAN[CHAIN_ID]}${renToken?.address || ''}`

  return (
    <>
      <Text.p>
          1. Connect your MetaMask to the <Text.span fontWeight="bold">{networkName}</Text.span> network.
      </Text.p>
      <Text.p>
          2. Head over <Link target="blank" href={faucet}>{faucet}</Link>
          &nbsp;and get some test ETH to pay for transactions.
      </Text.p>
      <Text.p>
          3. Get 1000 REN tokens by pressing the button below.
          To verify that the tokens are in your wallet, switch to the <Text.span fontWeight="bold">Assets</Text.span> tab in your MetaMask and press the <Text.span fontWeight="bold">Add Tokens</Text.span> button.
          Paste the address of the REN token contract from <Link target="blank" href={etherscan}>here</Link>.
      </Text.p>
      <RenFaucet disabled={!isAccountsUnlocked || wrongChain} />
      <Text.p>
          4. Enter the amount of REN you would like to deposit in the form above and hit the <Text.span fontWeight="bold">Approve</Text.span> button (this is only required for the first time).
          After the transaction is approved, you will be able to <Text.span fontWeight="bold">Deposit</Text.span> the desired amount of REN until the 100_000 target is reached.
          Once the pool is full, we lock deposits and withdraws and transfer the tokens to the REN protocol to spin up a new Dark Node instance.
        {/* You can find more info on how the Dark node is setup in the following link <a href="">TODO</a>. */}
      </Text.p>
      <Text.p></Text.p>
      <Text.p>5. You can withdraw all the funds at any time as long as the pool hasn&apos;t been locked.</Text.p>
      <Text.p>6. Claim rewards TODO</Text.p>
    </>
  )
}
