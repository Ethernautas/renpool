import copy
from brownie import ZERO_ADDRESS, accounts, config, network, RenToken, RenPool
import constants as C
import utils


def main():
    """
    Set your .env file accordingly before deploying the RenPool contract.
    In case of live networks, make sure your account is funded.
    """
    active_network: (str or None) = network.show_active()

    ren_token_addr = ZERO_ADDRESS
    darknode_registry_addr = ZERO_ADDRESS
    claim_rewards_addr = ZERO_ADDRESS
    gateway_addr = ZERO_ADDRESS
    owner = None
    node_operator = None
    ren_token = None

    if active_network == C.NETWORKS["DEVELOPMENT"]:
        ren_token = RenToken.deploy({"from": owner})
        ren_token_addr = ren_token.address
        owner = accounts[0]
        node_operator = accounts[1]
    else:
        ren_token_addr = C.CONTRACT_ADDRESSES[active_network]["REN_TOKEN"]
        darknode_registry_addr = C.CONTRACT_ADDRESSES[active_network]["DARKNODE_REGISTRY"]
        claim_rewards_addr = C.CONTRACT_ADDRESSES[active_network]["CLAIM_REWARDS"]
        gateway_addr = C.CONTRACT_ADDRESSES[active_network]["GATEWAY"]
        ren_token = utils.load_contract(ren_token_addr)

        account = accounts.add(config["wallets"]["from_key"])
        owner = copy.copy(account)
        node_operator = copy.copy(account)

    renPool = RenPool.deploy(
        ren_token_addr,
        darknode_registry_addr,
        claim_rewards_addr,
        gateway_addr,
        owner,
        C.POOL_BOND,
        {"from": node_operator},
    )

    return ren_token, renPool
