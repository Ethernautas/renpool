const {
    ethers: {
        BigNumber: { from: bn }
    },
    network: {
        config: {
            accounts,
            renTokenAddr,
            darknodeRegistryAddr,
            darknodePaymentAddr,
            claimRewardsAddr,
            gatewayRegistryAddr,
        }
    } } = require('hardhat');
const chalk = require('chalk');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const DECIMALS = 18;
const DIGITS = bn(10).pow(DECIMALS);
const POOL_BOND = bn(100_000).mul(DIGITS);

async function main() {
    console.log(`${chalk.italic('\u{1F680} RenPool contract deployment')}`);
    console.log(`Using network ${chalk.bold(hre.network.name)} (${chalk.bold(hre.network.config.chainId)})`);

    console.log(`> Getting signers to deploy RenPool contract`);
    const owner = new ethers.Wallet(accounts[0], ethers.provider);
    const nodeOperator = owner;

    console.log(`> Deploying ${chalk.bold('RenPool')} contract`);
    const RenPool = await ethers.getContractFactory('RenPool');
    const renPool = await RenPool.connect(nodeOperator).deploy(
        renTokenAddr,
        darknodeRegistryAddr,
        darknodePaymentAddr,
        claimRewardsAddr,
        gatewayRegistryAddr,
        owner.address,
        POOL_BOND);
    await renPool.deployed();

    console.log(`> Deployed to ${chalk.bold(renPool.address)} TX ${chalk.bold(renPool.deployTransaction.hash)}`);

    if (hre.network.name === 'hardhat') {
        console.log('> Skipping RenPool contract Etherscan verification')
    } else {
        console.log('> Waiting before verification');
        await sleep(30000);
        const balance = await renPool.balanceOf(owner.address);
        console.log(`  Owner's balance is ${chalk.yellow(balance)}`);

        console.log('> Verifying RenPool smart contract in Etherscan')

        await hre.run("verify:verify", {
            address: renPool.address,
            constructorArguments: [
                renTokenAddr,
                darknodeRegistryAddr,
                darknodePaymentAddr,
                claimRewardsAddr,
                gatewayRegistryAddr,
                owner.address,
                POOL_BOND
            ],
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
