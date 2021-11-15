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
darknode_payment_store_addr: str = contracts["darknode_payment_store"]
claim_rewards_addr: str = contracts["claim_rewards"]
gateway_addr: str = contracts["gateway"]


def check_network() -> None:
    if active_network not in supported_networks:
        raise ValueError(f"Unsupported network, switch to {str(supported_networks)}")


def get_ren_token() -> Contract or None:
    return (
        MintableForkToken(ren_token_addr)
        if active_network == "mainnet-fork"
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
    darknode_payment: Contract = Contract(darknode_payment_addr)
    darknode_payment_store: Contract = Contract(darknode_payment_store_addr)
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
    darknode_registry.epoch({"from": ren_pool})

    if darknode_registry.isRegistered(C.NODE_ID_HEX) != True:
        raise ValueError("Darknode not registered")
    # Transfer fees from darknode to the darknode's owner account on the REN protocol
    # tx1 = ren_pool.transferRewardsToDarknodeOwner([ren_BTC])
    # Is there any way to test this?

    # Transfer rewards from the REN protocol to the node operator wallet
    # tx2 = ren_pool.claimDarknodeRewards('renBTC', 1, node_operator)
    # tx2 = ren_pool.claimDarknodeRewards("BTC", 1, node_operator)

    # print("Locked balances: ", darknode_payment_store.lockedBalances("0x0A9ADD98C076448CBcFAcf5E457DA12ddbEF4A8f"))
    # print("Locked balances: ", darknode_payment_store.lockedBalances("0xC4375B7De8af5a38a93548eb8453a498222C4fF2"))
    # print("Locked balances: ", darknode_payment_store.lockedBalances("0x42805DA220DF1f8a33C16B0DF9CE876B9d416610"))
    # print("Locked balances: ", darknode_payment_store.lockedBalances("0x618dC53e856b1A601119F2Fed5F1E873bCf7Bd6e"))
    # print("Locked balances: ", darknode_payment_store.lockedBalances("0x2CD647668494c1B15743AB283A0f980d90a87394"))
    # print("Locked balances: ", darknode_payment_store.lockedBalances("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"))
    print("Darknode balances: ", darknode_payment_store.darknodeBalances(ren_pool, "0x0A9ADD98C076448CBcFAcf5E457DA12ddbEF4A8f"))
    print("Darknode balances: ", darknode_payment_store.darknodeBalances(ren_pool, "0xC4375B7De8af5a38a93548eb8453a498222C4fF2"))
    print("Darknode balances: ", darknode_payment_store.darknodeBalances(ren_pool, "0x42805DA220DF1f8a33C16B0DF9CE876B9d416610"))
    print("Darknode balances: ", darknode_payment_store.darknodeBalances(ren_pool, "0x618dC53e856b1A601119F2Fed5F1E873bCf7Bd6e"))
    print("Darknode balances: ", darknode_payment_store.darknodeBalances(ren_pool, "0x2CD647668494c1B15743AB283A0f980d90a87394"))
    print("Darknode balances: ", darknode_payment_store.darknodeBalances(ren_pool, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"))

            #     // We should have zero claimed balance before ticking
            # new BN(
            #     await dnp.darknodeBalances(darknode1, dai.address)
            # ).should.bignumber.equal(new BN(0));

            # // We don't need to claim since we weren't allocated rewards last cycle
            # // But claim shouldn't revert
    darknode_payment.claim(C.NODE_ID_HEX, {"from": node_operator})
    darknode_registry.epoch({"from": ren_pool})
    print("Darknode balances: ", darknode_payment_store.darknodeBalances(C.NODE_ID_HEX, "0x0A9ADD98C076448CBcFAcf5E457DA12ddbEF4A8f"))
            # await waitForEpoch(dnr);
    # Make sure rewards have been transferred to the target wallet
    # ren_BTC.balanceOf(node_operator) > node_operator_init_BTC_balance # Try to improve this!

    return ren_token, ren_pool
