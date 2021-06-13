import React, {Component} from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./getEthereum"

class App extends Component {

    state = {
        web3: null,
        accounts: null,
        chainId: null,
        renPool: null,
        totalPooled: 0,
        inputValue: 0,
    }

    componentDidMount = async () => {

        // Get network provider and web3 instance.
        const web3 = await getWeb3()

        // Try and enable accounts (connect metamask)
        try {
            const ethereum = await getEthereum()
            ethereum.enable()
        } catch (e) {
            console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }

        // Use web3 to get the user's accounts
        const accounts = await web3.eth.getAccounts()

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

        // const renToken = await this.loadContract("dev", "ERC20")
        // ^ TODO: we need RenToken contract (instance of ERC20) in order to approve transaction before deposit
        const renPool = await this.loadContract("dev", "RenPool")

        if (renPool == null) {
            return
        }

        const totalPooled = await renPool.methods.totalPooled().call()

        this.setState({ renPool, totalPooled })
    }

    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const {web3} = this.state

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

        return new web3.eth.Contract(contractArtifact.abi, address)
    }

    handleDeposit = async (e) => {
        const {accounts, renPool, inputValue} = this.state
        e.preventDefault()
        const value = parseInt(inputValue)
        if (isNaN(value)) {
            alert("invalid value")
            return
        }
        await renPool.methods.deposit(value).send({from: accounts[0]})
            .on('receipt', async () => {
                this.setState({
                    totalPooled: await renPool.methods.totalPooled().call()
                })
            })
    }

    render() {
        const { web3, accounts, chainId, renPool, totalPooled, inputValue } = this.state

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
                <form onSubmit={(e) => { this.handleDeposit(e) }}>
                    <div>
                        <label>Deposit REN: </label>
                        <br/>
                        <input
                            name="inputValue"
                            type="text"
                            value={inputValue}
                            onChange={(e) => { this.setState({ inputValue: e.target.value }) }}
                        />
                        <br/>
                        <button type="submit" disabled={!isAccountsUnlocked}>Submit</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default App
