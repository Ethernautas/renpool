import React, {Component} from "react"
import isNumber from 'lodash/isNumber'
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import { getEthereum } from "./getEthereum"
import { MAX_UINT256 } from './constants'

class App extends Component {

    state = {
        web3: null,
        accounts: null,
        chainId: null,
        renToken: null,
        renTokenAddr: null,
        renPool: null,
        renPoolAddr: null,
        totalPooled: 0,
        isApproved: false,
        amount: 0,
    }

    componentDidMount = async () => {

        // Get network provider and web3 instance.
        const web3 = await getWeb3()

        // Try and enable accounts (connect metamask)
        let ethereum
        try {
            ethereum = await getEthereum()
            ethereum.enable()
        } catch (e) {
            console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }

        // Use web3 to get the user's accounts
        // const accounts = await web3.eth.getAccounts()
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

        // Get the current chain id
        const chainId = parseInt(await web3.eth.getChainId())

        this.setState({
            web3,
            accounts,
            chainId
        }, await this.loadInitialContracts)

    }

    loadInitialContracts = async () => {
        if (this.state.chainId <= 42) {
            // Wrong Network!
            return
        }

        const [renTokenAddr, renToken] = await this.loadContract("dev", "ERC20")
        const [renPoolAddr, renPool] = await this.loadContract("dev", "RenPool")

        if (renToken == null || renPool == null) {
            return
        }

        const totalPooled = await renPool.methods.totalPooled().call()

        this.setState({ renTokenAddr, renToken, renPoolAddr, renPool, totalPooled })
    }

    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const { web3 } = this.state

        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][0]
        } catch (e) {
            console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`)
            return undefined
        }

        // Load the artifact with the specified address
        let contractArtifact
        try {
            contractArtifact = await import(`./artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }

        return [address, new web3.eth.Contract(contractArtifact.abi, address)]
    }

    isTransferApproved = async (amount) => {
        const { accounts, renToken, renPoolAddr } = this.state

        const allowance = await renToken.methods.allowance(accounts[0], renPoolAddr).call()

        return allowance - amount >= 0
    }

    handleChange = async (amount) => {
        const { renPoolAddr } = this.state

        const value = amount != null ? parseInt(amount, 10) : amount
        this.setState({ amount: value })

        const isApproved = isNumber(value) && value > 0
            ? await this.isTransferApproved(value)
            : false

        this.setState({ isApproved })
    }

    handleApprove = async (e) => {
        e.preventDefault()

        const { accounts, renToken, renPoolAddr, amount } = this.state

        const value = parseInt(amount)

        await renToken.methods.approve(renPoolAddr, MAX_UINT256).send({ from: accounts[0] })
            .on('receipt', async () => {
                console.log('ON RECEIPT')
                this.setState({ isApproved: await this.isTransferApproved(value) })
            })
            .on('error', (e) => { console.log('ERROR', e) })
    }

    handleDeposit = async (e) => {
        e.preventDefault()

        const { accounts, renPool, isApproved, amount } = this.state

        if (!isApproved) {
            alert("you need to approve the transaction first")
            return
        }

        const value = parseInt(amount)
        if (isNaN(value)) {
            alert("invalid value")
            return
        }

        await renPool.methods.deposit(value).send({ from: accounts[0] })
            .on('receipt', async () => {
                this.setState({
                    totalPooled: await renPool.methods.totalPooled().call()
                })
            })
    }

    render() {
        const { web3, accounts, chainId, renPool, totalPooled, isApproved, amount } = this.state

        if (web3 == null) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }

        if (isNaN(chainId) || chainId <= 42) {
            return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        if (renPool == null) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false

        return (
            <div className="App">
                {!isAccountsUnlocked && (
                    <p><strong>Connect with Metamask and refresh the page to
                            be able to edit the storage fields.</strong>
                    </p>
                )}
                <h2>RenPool Contract</h2>

                <div>The stored value is: {totalPooled}</div>
                <br/>
                <form
                    onSubmit={(e) => {
                        if (isApproved) {
                            this.handleDeposit(e)
                        } else {
                            this.handleApprove(e)
                        }
                    }}
                >
                    <div>
                        <label>Deposit REN: </label>
                        <br/>
                        <input
                            name="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => { this.handleChange(e.target.value) }}
                        />
                        <br/>
                        <button
                            type="submit"
                            disabled={!isAccountsUnlocked}
                        >
                            {isApproved ? 'Submit' : 'Approve'}
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

export default App
