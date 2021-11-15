from brownie import chain, accounts, reverts
import pytest
import constants as C

ETHEREUM = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"


def test_darknode_claim_rewards(
    node_operator,
    ren_pool,
    ren_token,
    ren_BTC,
    darknode_registry,
    darknode_payment,
    darknode_payment_store,
    claimless_rewards,
):
    """
    Test transfering rewards from the REN protocol to the given address.
    """
    chain.snapshot()

    node_operator_init_BTC_balance: int = ren_BTC.balanceOf(node_operator)

    # Lock pool
    ren_token.approve(ren_pool, C.POOL_BOND, {"from": node_operator})
    ren_pool.deposit(C.POOL_BOND, {"from": node_operator})

    # Register darknode
    ren_pool.approveBondTransfer({"from": node_operator})
    ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {"from": node_operator})

    # Skip to the next epoch (1 month) for the registration to settle
    chain.mine(timedelta=C.ONE_MONTH)
    darknode_registry.epoch({"from": ren_pool})

    # Make sure the darknode is under the 'registered' state
    assert darknode_registry.isRegistered(C.NODE_ID_HEX) == True
    assert darknode_registry.getDarknodeOperator(C.NODE_ID_HEX) == ren_pool

    # Skip to the next epoch to make sure we have fees to claim
    # chain.mine(timedelta=C.ONE_MONTH)
    # darknode_registry.epoch({"from": ren_pool})
    # chain.mine(timedelta=C.ONE_MONTH)
    # darknode_registry.epoch({"from": ren_pool})
    # chain.mine(timedelta=C.ONE_MONTH)
    # darknode_registry.epoch({"from": ren_pool})

    # darknode_payment.claim(C.NODE_ID_HEX, {"from": node_operator})
    chain.mine(timedelta=C.ONE_MONTH)
    darknode_registry.epoch({"from": ren_pool})
    # darknode_registry.epoch({"from": ren_pool})
    assert claimless_rewards.withdraw(C.NODE_ID_HEX, "0x0A9ADD98C076448CBcFAcf5E457DA12ddbEF4A8f", {"from": node_operator})
    assert claimless_rewards.darknodeBalances(C.NODE_ID_HEX, "0x0A9ADD98C076448CBcFAcf5E457DA12ddbEF4A8f") > 0
    assert claimless_rewards.darknodeBalances(C.NODE_ID_HEX, "0xC4375B7De8af5a38a93548eb8453a498222C4fF2") > 0
    assert claimless_rewards.darknodeBalances(C.NODE_ID_HEX, "0x42805DA220DF1f8a33C16B0DF9CE876B9d416610") > 0
    assert claimless_rewards.darknodeBalances(C.NODE_ID_HEX, "0x618dC53e856b1A601119F2Fed5F1E873bCf7Bd6e") > 0
    assert claimless_rewards.darknodeBalances(C.NODE_ID_HEX, "0x2CD647668494c1B15743AB283A0f980d90a87394") > 0
    assert claimless_rewards.darknodeBalances(C.NODE_ID_HEX, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") > 0
    # assert darknode_payment_store.darknodeBalances(ren_pool, "0x42805DA220DF1f8a33C16B0DF9CE876B9d416610") > 0
    # assert darknode_payment_store.darknodeBalances(ren_pool, "0x0A9ADD98C076448CBcFAcf5E457DA12ddbEF4A8f") > 0
    # assert (
    #     darknode_payment_store.lockedBalances(
    #         "0x0A9ADD98C076448CBcFAcf5E457DA12ddbEF4A8f"
    #     )
    #     > 0
    # )
    # balanceBefore = ren_BTC.balanceOfUnderlying(ren_pool)
    # balanceBefore = ren_BTC.balanceOf(ren_pool)
    # assert balanceBefore > 0
    # Transfer fees from darknode to the darknode's owner account on the REN protocol
    # ren_pool.transferRewardsToDarknodeOwner([ren_BTC])
    # Is there any way to test this?

    # Transfer rewards from the REN protocol to the node operator wallet
    # ren_pool.claimDarknodeRewards("renBTC", 1, node_operator)

    # Make sure rewards have been transferred to the target wallet
    # ren_BTC.balanceOf(
    #     node_operator
    # ) > node_operator_init_BTC_balance  # Try to improve this!


# TODO: test remaining paths
