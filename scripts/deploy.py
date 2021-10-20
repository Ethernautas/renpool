import copy
from brownie import ZERO_ADDRESS, accounts, config, RenToken, RenPool
import constants as C
import utils


def main():
    """
    Set your .env file accordingly before deploying the RenPool contract.
    In case of live networks, make sure your account is funded.
    """
    network = config["networks"]["default"]

    renTokenAddr = ZERO_ADDRESS
    darknodeRegistryAddr = ZERO_ADDRESS
    claimRewardsAddr = ZERO_ADDRESS
    gatewayAddr = ZERO_ADDRESS
    owner = None
    nodeOperator = None
    renToken = None

    if network == C.NETWORKS["DEVELOPMENT"]:
        renToken = RenToken.deploy({"from": owner})
        renTokenAddr = renToken.address
        owner = accounts[0]
        nodeOperator = accounts[1]
    else:
        renTokenAddr = C.CONTRACT_ADDRESSES[network]["REN_TOKEN"]
        darknodeRegistryAddr = C.CONTRACT_ADDRESSES[network]["DARKNODE_REGISTRY"]
        claimRewardsAddr = C.CONTRACT_ADDRESSES[network]["CLAIM_REWARDS"]
        gatewayAddr = C.CONTRACT_ADDRESSES[network]["GATEWAY"]
        renToken = utils.load_contract(renTokenAddr)

        account = accounts.add(config["wallets"]["from_key"])
        owner = copy.copy(account)
        nodeOperator = copy.copy(account)

    renPool = RenPool.deploy(
        renTokenAddr,
        darknodeRegistryAddr,
        claimRewardsAddr,
        gatewayAddr,
        owner,
        C.POOL_BOND,
        {"from": nodeOperator},
    )

    return renToken, renPool
