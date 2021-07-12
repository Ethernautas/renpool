# RenPool project

Bringing community pools to the REN ecosystem

## Getting started
1. Install brownie:
- [https://iamdefinitelyahuman.medium.com/getting-started-with-brownie-part-1-9b2181f4cb99](https://iamdefinitelyahuman.medium.com/getting-started-with-brownie-part-1-9b2181f4cb99)
- [https://eth-brownie.readthedocs.io/en/stable/install.html](https://eth-brownie.readthedocs.io/en/stable/install.html)
- [https://www.youtube.com/watch?v=nkvIFE2QVp0](https://www.youtube.com/watch?v=nkvIFE2QVp0)

2. Create a new file called `.env` from `.env.sample`. Add your Metamask mnemonic and Infura project id.

3. Init brownie console. This will create a local blockchain plus 10 `accounts` loaded with eth associated to your Metamask.

```bash
>> brownie console
```

4. Mint a ERC20 token called REN and deploy RenPool contract to local net. You'll get a fresh instance every time you init the brownie console.

```bash
>> renToken, renPool = run('deploy')
```

5. You can now interact with the `renToken` and `renPool` contracts using any of the `accounts` provided by brownie and any of the contracts' methods.

Get some ren tokens from the faucet
```bash
>> acc = accounts[1]
>> renToken.balanceOf(acc)
>> 0
>> renToken.getFromFaucet({'from': acc})
>> renToken.balanceOf(acc)
>> 1000000000000000000000
```

Deposit ren tokens into the ren pool
```bash
>> tx1 = renToken.approve(renPool.address, 100, {'from': acc})
>> tx2 = renPool.deposit(100, {'from': acc})
```

Verify that the ren pool balance has increased
```bash
>> renPool.totalPooled()
>> 100
```

6. Running tests (open a new terminal).

```bash
>> brownie test
```

## Manually deploy client app

[https://www.freecodecamp.org/news/how-to-deploy-a-react-application-to-netlify-363b8a98a985/](https://www.freecodecamp.org/news/how-to-deploy-a-react-application-to-netlify-363b8a98a985/)

Install Netlify CLI: `npm install netlify-cli -g`.

Then `yarn run deploy`.

The app is deployed to [https://renpool.netlify.app/](https://renpool.netlify.app/)

## Deploy smart contract

[https://www.quicknode.com/guides/vyper/how-to-write-an-ethereum-smart-contract-using-vyper](https://www.quicknode.com/guides/vyper/how-to-write-an-ethereum-smart-contract-using-vyper)

## Setup and deploy to test networks

1. [https://youtu.be/5jiqOUljfG8](https://youtu.be/5jiqOUljfG8)

2. [https://youtu.be/KNBneUpFaGo](https://youtu.be/KNBneUpFaGo)

# Brownie React Mix

This mix comes with everything you need to start using [React](https://reactjs.org/) with a Brownie project.

## Installation

1. [Install Brownie](https://eth-brownie.readthedocs.io/en/stable/install.html), if you haven't already. You must be using version `1.9.0` or newer.

2. Download the mix.

    ```bash
    brownie bake react-mix
    ```

3. Install the React client dependencies.

    ```bash
    cd client
    yarn install
    ```

4. In [MetaMask](https://metamask.io/) or another web3 browser extension, load the following seed phrase:

    ```bash
    hill law jazz limb penalty escape public dish stand bracket blue jar
    ```

    These accounts will automatically be funded.

## Usage

1. Open the Brownie console. Starting the console launches a fresh [Ganache](https://www.trufflesuite.com/ganache) instance in the background.

    ```bash
    $ brownie console
    Brownie v1.9.0 - Python development framework for Ethereum

    ReactMixProject is the active project.
    Launching 'ganache-cli'...
    Brownie environment is ready.
    ```

2. Run the [deployment script](scripts/deploy.py) to deploy the project's smart contracts.

    ```python
    >>> run("deploy")
    Running 'scripts.deploy.main'...
    Transaction sent: 0xd1000d04fe99a07db864bcd1095ddf5cb279b43be8e159f94dbff9d4e4809c70
    Gas price: 0.0 gwei   Gas limit: 6721975
    SolidityStorage.constructor confirmed - Block: 1   Gas used: 110641 (1.65%)
    SolidityStorage deployed at: 0xF104A50668c3b1026E8f9B0d9D404faF8E42e642

    Transaction sent: 0xee112392522ed24ac6ab8cc8ba09bfe51c5d699d9d1b39294ba87e5d2a56212c
    Gas price: 0.0 gwei   Gas limit: 6721975
    VyperStorage.constructor confirmed - Block: 2   Gas used: 134750 (2.00%)
    VyperStorage deployed at: 0xB8485421abC325D172652123dBd71D58b8117070
    ```

3. While Brownie is still running, start the React app in a different terminal.

    ```bash
    # make sure to use a different terminal, not the brownie console
    cd client
    yarn start
    ```

4. Connect Metamask to the local Ganache network. In the upper right corner, click the network dropdown menu. Select `Localhost 8545`, or:

    ```bash
    New Custom RPC
    http://localhost:8545
    ```

5. Interact with the smart contracts using the web interface or via the Brownie console.

    ```python
    # get the newest vyper storage contract
    >>> vyper_storage = VyperStorage[-1]

    # the default sender of the transaction is the contract creator
    >>> vyper_storage.set(1337)
    ```

    Any changes to the contracts from the console should show on the website after a refresh, and vice versa.

## Ending a Session

When you close the Brownie console, the Ganache instance also terminates and the deployment artifacts are deleted.

To retain your deployment artifacts (and their functionality) you can launch Ganache yourself prior to launching Brownie. Brownie automatically attaches to the ganache instance where you can deploy the contracts. After closing Brownie, the chain and deployment artifacts will persist.

## Switching Networks

```bash
export WEB3_INFURA_PROJECT_ID=YourProjectID
brownie console --network mainnet-fork
```

## Further Possibilities

### Testing

To run the test suite:

```bash
brownie test
```

### Deploying to a Live Network

To deploy your contracts to the mainnet or one of the test nets, first modify [`scripts/deploy.py`](`scripts/deploy.py`) to [use a funded account](https://eth-brownie.readthedocs.io/en/stable/account-management.html).

Then:

```bash
brownie run deploy --network kovan
```

Replace `kovan` with the name of the network you wish you use. You may also wish to adjust Brownie's [network settings](https://eth-brownie.readthedocs.io/en/stable/network-management.html).

For contracts deployed on a live network, the deployment information is stored permanently unless you:

* Delete or rename the contract file or
* Manually remove the `client/src/artifacts/` directory

## Resources

This mix provides a bare-bones implementation of [Create React App](https://create-react-app.dev/), configured to work with Brownie.

To get started with React and building a front-end for your dApps:

* [Rimble](https://rimble.consensys.design/) is an open-source library of React components and guides to help you make dApps. Along with components they provide guides and tutorials to help you get started.
* For more in-depth information, read the [Create React App documentation](https://create-react-app.dev/docs/getting-started)


To get started with Brownie:

* Check out the other [Brownie mixes](https://github.com/brownie-mix/) that can be used as a starting point for your own contracts. They also provide example code to help you get started.
* ["Getting Started with Brownie"](https://medium.com/@iamdefinitelyahuman/getting-started-with-brownie-part-1-9b2181f4cb99) is a good tutorial to help you familiarize yourself with Brownie
* For more in-depth information, read the [Brownie documentation](https://eth-brownie.readthedocs.io/en/stable/)


Any questions? Join our [Gitter](https://gitter.im/eth-brownie/community) channel to chat and share with others in the community.

# Further read
1. [https://renproject.io/](https://renproject.io/)
2. [https://github.com/renproject](https://github.com/renproject)
3. [https://docs.renproject.io/developers/docs/deployed-contracts](https://docs.renproject.io/developers/docs/deployed-contracts)
4. [https://ethereum.org/en/developers/docs/standards/tokens/erc-20/](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/)
5. REN token [https://etherscan.io/token/0x408e41876cccdc0f92210600ef50372656052a38](https://etherscan.io/token/0x408e41876cccdc0f92210600ef50372656052a38)
6. REN token testnet addresses [https://renproject.github.io/contracts-ts/#/testnet](https://renproject.github.io/contracts-ts/#/testnet)

