from brownie import accounts, config, network, RenToken, RenPool
from brownie.network.account import Account
from brownie.network.contract import Contract
import constants as C
import utils

active_network: str or None = network.show_active()
is_development: bool = active_network == C.NETWORKS["DEVELOPMENT"]

ren_token_addr = C.CONTRACT_ADDRESSES[active_network]["REN_TOKEN"]
darknode_registry_addr = C.CONTRACT_ADDRESSES[active_network]["DARKNODE_REGISTRY"]
claim_rewards_addr = C.CONTRACT_ADDRESSES[active_network]["CLAIM_REWARDS"]
gateway_addr = C.CONTRACT_ADDRESSES[active_network]["GATEWAY"]


def get_owner() -> Account:
    return (
        accounts[0] if is_development else accounts.add(config["wallets"]["from_key"])
    )


def get_node_operator() -> Account:
    return get_owner()


def get_ren_token(owner: Account) -> Contract or None:
    return (
        RenToken.deploy({"from": owner})
        if is_development
        else utils.load_contract(ren_token_addr)
    )


def main() -> tuple[Contract, Contract]:
    """
    Set your .env file accordingly before deploying the RenPool contract.
    In case of live networks, make sure your account is funded.
    """
    owner: Account = get_owner()
    node_operator: Account = get_node_operator()
    ren_token: Contract = get_ren_token(owner)

    ren_pool = RenPool.deploy(
        ren_token.address(),
        darknode_registry_addr,
        claim_rewards_addr,
        gateway_addr,
        owner,
        C.POOL_BOND,
        {"from": node_operator},
        publish_source = True,
    )

    return ren_token, ren_pool
