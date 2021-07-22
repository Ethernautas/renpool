import React from 'react'
import { Heading, Text, Box } from 'rimble-ui'
import { NETWORKS, CONTRACT_NAMES } from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useContract } from '../../hooks/useContract'
import { RenFaucet } from '../RenFaucet'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export const FAQs = (): JSX.Element => {
  const { chainId, account } = useActiveWeb3React()
  const renToken = useContract(CONTRACT_NAMES.RenToken)

  const isAccountsUnlocked = account != null
  const wrongChain = chainId != parseInt(CHAIN_ID, 10)

  return (
    <Box>
      <Heading.h3 textAlign="center">How it works</Heading.h3>
      <Box p={2} />
      <Box bg="white" p={3}>
        <Text.p>
          1. Connect your MetaMask to the {NETWORKS[CHAIN_ID]} network
        </Text.p>
        <Text.p>
          2. Head over <a target="blank" href="https://faucet.rinkeby.io/">https://faucet.rinkeby.io/</a>
          &nbsp;and get some test ETH to pay for transactions
        </Text.p>
        <Text.p>
          3. Get 1000 REN tokens by pressing the button below.
          To verify that the tokens are in your wallet, switch to the ASSETS tab in your MetaMask and press the &apos;ADD TOKEN&apos; button.
          There, paste the address of the REN token contract: {renToken?.address || ''}
        </Text.p>
        <RenFaucet disabled={!isAccountsUnlocked || wrongChain} />
        <Text.p>
          4. Head over the form above, enter the amount of REN you would like to deposit and hit the Approve button.
          After the transaction is approved, you will be able to Deposit the desired amount of REN until the 100_000 target is reached.
          Once that happens the pool is locked and the REN tokens are transaferred to the REN protocol to instantiate the Dark node.
          You can find more info on how the Dark node is setup in the following link <a href="">TODO</a>
        </Text.p>
        <Text.p></Text.p>
        <Text.p>5. Withdraw TODO</Text.p>
        <Text.p>6. Claim rewards TODO</Text.p>
      </Box>
    </Box>
  )
}
