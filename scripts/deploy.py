from brownie import accounts, config, network, RenToken, RenPool
from brownie.network.account import Account
from brownie.network.contract import Contract
import constants as C
import utils

active_network: str = config["networks"]["default"]
is_development: bool = active_network == "development"

contracts = config["networks"][active_network]["contracts"]

ren_token_addr: str = contracts["ren_token"]
darknode_registry_addr: str = contracts["darknode_registry"]
claim_rewards_addr: str = contracts["claim_rewards"]
gateway_addr: str = contracts["gateway"]


def get_owner() -> Account:
    """
    When in development, use the first Ganache account as the owner.
    Otherwise, load from config.
    """
    return (
        accounts[0] if is_development else accounts.add(config["wallets"]["from_key"])
    )


def get_node_operator() -> Account:
    """
    For now we set node_operator to equal owner, could be a different account in the future.
    """
    return get_owner()


def get_ren_token(owner: Account) -> Contract or None:
    """
    When in development, we a mock to interact to the ren token contract.
    Load the real contract otherwise.
    """
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
        publish_source=True,
    )

    return ren_token, ren_pool
