from brownie import accounts, config, Contract, RenPool
from brownie.network.account import Account
from brownie_tokens import MintableForkToken
from kovan_tokens.forked import MintableKovanForkToken
import constants as C

active_network: str = config["networks"]["default"]
supported_networks: list[str] = ["mainnet-fork", "kovan-fork"]

contracts = config["networks"][active_network]["contracts"]

ren_BTC_addr: str = contracts["ren_BTC"]
ren_token_addr: str = contracts["ren_token"]
darknode_registry_addr: str = contracts["darknode_registry"]
darknode_payment_addr: str = contracts["darknode_payment"]
claim_rewards_addr: str = contracts["payment_rewards"]
gateway_addr: str = contracts["gateway"]


def check_network() -> None:
    if active_network not in supported_networks:
        raise ValueError(f"Unsupported network, switch to {str(supported_networks)}")


def get_ren_token(owner: Account) -> Contract or None:
    return (
        MintableForkToken(ren_token_addr)
        if active_network == C.NETWORKS["MAINNET_FORK"]
        else MintableKovanForkToken(ren_token_addr)
    )


def main() -> list[Contract, Contract, any, any]:
    """
    Deploy a RenPool contract to the mainnet-fork, lock the
    pool by providing liquidity and finally register a
    darknode instance.
    See: https://youtu.be/0JrDbvBClEA (brownie tutorial)
    See: https://renproject.github.io/contracts-ts/#/mainnet
    """
    check_network()

    owner: Account = accounts[0]
    node_operator: Account = accounts[1]
    user: Account = accounts[2]

    ren_pool: Contract = RenPool.deploy(
        ren_token_addr,
        darknode_registry_addr,
        darknode_payment_addr,
        claim_rewards_addr,
        gateway_addr,
        owner,
        C.POOL_BOND,
        {"from": node_operator},
    )

    darknode_registry: Contract = Contract(darknode_registry_addr)
    ren_BTC: Contract = Contract(ren_BTC_addr)

    ren_token = get_ren_token()
    ren_token._mint_for_testing(user, C.POOL_BOND)

    ren_token.approve(ren_pool, C.POOL_BOND, {"from": user})
    ren_pool.deposit(C.POOL_BOND, {"from": user})

    if ren_pool.isLocked() != True:
        raise ValueError("Pool is not locked")

    ren_pool.approveBondTransfer({"from": node_operator})
    ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {"from": node_operator})

    # Skip to the next epoch (1 month) for the registration to settle
    darknode_registry.epoch({"from": ren_pool})

    # Transfer fees from darknode to the darknode's owner account on the REN protocol
    tx1 = ren_pool.transferRewardsToDarknodeOwner([ren_BTC])
    # Is there any way to test this?

    # Transfer rewards from the REN protocol to the node operator wallet
    # tx2 = ren_pool.claimDarknodeRewards('renBTC', 1, node_operator)
    tx2 = ren_pool.claimDarknodeRewards("BTC", 1, node_operator)

    # Make sure rewards have been transferred to the target wallet
    # ren_BTC.balanceOf(node_operator) > node_operator_init_BTC_balance # Try to improve this!

    return ren_token, ren_pool, tx1, tx2
