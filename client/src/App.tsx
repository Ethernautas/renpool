import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Heading, Text, Flex, Box, EthAddress, Flash } from 'rimble-ui'
import './App.css'
import { NETWORKS, CONTRACT_NAMES, MAX_UINT256 } from './constants'
import { useActiveWeb3React } from './hooks/useActiveWeb3React'
import { useContract } from './hooks/useContract'
import { Header } from './components/Header'
import { RenFaucet } from './components/RenFaucet'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const DECIMALS = 18

enum Actions {
  approve = 'approve',
  deposit = 'deposit',
}

export const App = (): JSX.Element => {
  const { chainId, account } = useActiveWeb3React()
  const renToken = useContract(CONTRACT_NAMES.RenToken)
  const renPool = useContract(CONTRACT_NAMES.RenPool)

  const [totalPooled, setTotalPooled] = useState<BigNumber>(BigNumber.from(0))
  const [isApproved, setIsApproved] = useState(false)
  const [input, setInput] = useState<string>('')
  const [disabled, setDisabled] = useState(false)

  // Query totalPooled once contracts are ready
  useEffect(() => {
    if (renPool != null) {
      renPool.totalPooled({ gasLimit: 60000 })
        .then((totalPooled: BigNumber) => {
          setTotalPooled(totalPooled) })
        .catch((e: Error) => { alert(`Error while trying to query totalPooled ${JSON.stringify(e, null, 2)}`) })
    }
  }, [renPool])

  const checkForApproval = async (value: BigNumber): Promise<boolean> => {
    if (renToken == null) return false
    if (value.lt(BigNumber.from(1))) return false
    const allowance: BigNumber = await renToken.allowance(account, renPool.address)
    return allowance.sub(value).gte(BigNumber.from(0))
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const str: string = e.target.value
    const regex = /[0-9]/g
    const value = str.match(regex)?.join('') || ''
    setInput(value)
    if (value == null || value === '') return
    const _isApproved = await checkForApproval(BigNumber.from(parseUnits(value, DECIMALS)))
    setIsApproved(_isApproved)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, action: Actions): Promise<void> => {
    e.preventDefault()
    setDisabled(true)

    if (renPool == null) return

    if (BigNumber.from(input).lt(BigNumber.from(1))) {
      alert('invalid amount')
      setDisabled(false)
      return
    }

    if (action === Actions.approve) {
      const tx = await renToken.approve(renPool.address, MAX_UINT256)
      await tx.wait() // wait for mining
      const _isApproved = await checkForApproval(BigNumber.from(parseUnits(input, DECIMALS)))
      setIsApproved(_isApproved)
    }

    if (action === Actions.deposit) {
      if (!isApproved) {
        alert('you need to approve the transaction first',)
        setDisabled(false)
        return
      }

      try {
        const renAmount = BigNumber.from(parseUnits(input, DECIMALS))
        console.log('REN AMOUNT', renAmount)
        const tx = await renPool.deposit(renAmount, { gasLimit: 200000 })
        await tx.wait() // wait for mining
        const _totalPooled: BigNumber = await renPool.totalPooled({ gasLimit: 60000 })
        setTotalPooled(BigNumber.from(_totalPooled))
        setInput('0')
      } catch (e) {
        alert(`Could not deposit, ${JSON.stringify(e, null, 2)}`)
      }
    }

    setDisabled(false)
  }

  const isAccountsUnlocked = account != null
  const wrongChain = chainId != parseInt(CHAIN_ID, 10)

  return (
    <>
      <Header />

      <div className="App">
        {!isAccountsUnlocked && (
          <Flash my={3} variant="warning">
            Connect with Metamask and refresh the page to be able to edit the storage fields.
          </Flash>
        )}

        {wrongChain && (
          <Flash my={3} variant="warning">
            Connect to {NETWORKS[CHAIN_ID]}.
          </Flash>
        )}

        <h2>RenPool Contract</h2>
        <div>The stored value is: {formatUnits(totalPooled, DECIMALS)}</div>
        <br/>
        <form onSubmit={(e) => { handleSubmit(e, isApproved ? Actions.deposit : Actions.approve) }}>
          <div>
            <label>Deposit REN: </label>
            <br/>
            <input
              name="amount"
              type="text"
              value={input}
              disabled={!isAccountsUnlocked || disabled}
              onChange={handleChange}
            />
            <br/>
            <button
              type="submit"
              disabled={!isAccountsUnlocked || disabled || input == null || input.replaceAll('0', '') === ''}
            >
              {isApproved ? 'Deposit' : 'Approve'}
            </button>
          </div>
        </form>
      </div>
      <Flex flexDirection="column" alignItems="center" justifyContent="center">
        <Box p={2} width={[1, 1, 0.5]}>
          <Heading.h3>How it works?</Heading.h3>
        </Box>
        <Box p={2} width={[1, 1, 0.5]}>
          <Heading.h4>1. Connect with MetaMask</Heading.h4>
          <Text.p>Connect your MetaMask to the {NETWORKS[CHAIN_ID]} network</Text.p>
        </Box>
        <Box p={2} width={[1, 1, 0.5]}>
          <Heading.h4>2. Get some ETH</Heading.h4>
          <Text.p>Head over <a href="https://faucet.rinkeby.io/">https://faucet.rinkeby.io/</a> and get some test ETH to pay for transactions</Text.p>
        </Box>
        <Box p={2} width={[1, 1, 0.5]}>
          <Heading.h4>3. Get some REN</Heading.h4>
          <Text.p>Get 1000 REN tokens by pressing the button below.</Text.p>
          <RenFaucet disabled={!isAccountsUnlocked || wrongChain} />
          <Text.p>To verify that the REN tokens are in your wallet, switch to the ASSETS tab in your MetaMask and press the &apos;ADD TOKEN&apos; button.
          There, you can paste the address of the REN token contract:</Text.p>
          <EthAddress address={renToken?.address || ''} textLabels />
        </Box>
        <Box p={2} width={[1, 1, 0.5]}>
          <Heading.h4>4. Deposite REN into the pool</Heading.h4>
          <Text.p>Head over the form above, enter the amount of REN you would like to deposit into the pool and hit the Approve button.
            Once the transaction is apporved you will be able to Deposit the desired amount of REN into the pool until the 100_000 target is reached.
            Once that happens the pool is locked and the REN tokens are transaferred to the REN protocol to instantiate the Dark node.</Text.p>
          <Text.p>You can find more info on how the Dark node is setup in the following link <a href=""></a></Text.p>
        </Box>
        <Box p={2} width={[1, 1, 0.5]}>
          <Heading.h4>5. Withdraw</Heading.h4>
          <Text.p>TODO</Text.p>
        </Box>
        <Box p={2} width={[1, 1, 0.5]}>
          <Heading.h4>5. Claim rewards</Heading.h4>
          <Text.p>TODO</Text.p>
        </Box>
      </Flex>
    </>
  )
}
