from brownie import chain, accounts, reverts
import pytest
import constants as C


@pytest.mark.parametrize("user", accounts[0:3])  # [owner, nodeOperator, user]
def test_darknode_transfer_rewards_to_darknode_owner(
    node_operator,
    ren_pool,
    ren_token,
    ren_BTC,
    darknode_registry,
    user,
):
    """
    Test transfering rewards from darknode to darknode owner.
    """
    chain.snapshot()

    # Lock pool
    ren_token.approve(ren_pool, C.POOL_BOND, {"from": user})
    ren_pool.deposit(C.POOL_BOND, {"from": user})

    # Register darknode
    ren_pool.approveBondTransfer({"from": node_operator})
    ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {"from": node_operator})

    # Skip to the next epoch (1 month) for the registration to settle
    chain.mine(timedelta=C.ONE_MONTH)
    darknode_registry.epoch({"from": ren_pool})

    # Make sure the darknode is under the 'registered' state
    assert darknode_registry.isRegistered(C.NODE_ID_HEX) == True

    # Skip to the next epoch to make sure we have fees to claim
    chain.mine(timedelta=C.ONE_MONTH)
    darknode_registry.epoch({"from": ren_pool})

    # Transfer fees from darknode to the darknode's owner account on the REN protocol
    assert ren_pool.transferRewardsToDarknodeOwner([ren_BTC])
    # Is there any way to test this?


# TODO: test remaining paths
