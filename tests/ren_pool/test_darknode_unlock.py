from brownie import chain, accounts
import pytest
import constants as C


@pytest.mark.parametrize("user", accounts[0:3])  # [owner, nodeOperator, user]
def test_darknode_unlock(node_operator, ren_pool, ren_token, user):
    """
    Test darknode unlocking.
    """
    user_init_balance = ren_token.balanceOf(user)

    # Lock pool
    ren_token.approve(ren_pool, C.POOL_BOND, {"from": user})
    ren_pool.deposit(C.POOL_BOND, {"from": user})
    assert ren_pool.isLocked() == True

    # Unlock pool to release funds
    ren_pool.unlockPool({"from": node_operator})
    assert ren_pool.isLocked() == False

    # Refund staker(s)
    ren_pool.withdraw(C.POOL_BOND, {"from": user})
    assert ren_token.balanceOf(user) == user_init_balance
