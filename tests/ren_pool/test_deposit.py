from brownie.test import given, strategy
from brownie import accounts
import pytest
import constants as C

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
@given(
    amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND),
)
def test_ren_pool_deposit(ren_pool, ren_token, user, amount):
    """
    Test deposit.
    """
    user_init_balance = ren_token.balanceOf(user)

    # User deposits 'amount' into the pool
    ren_token.approve(ren_pool, amount, {'from': user})
    ren_pool.deposit(amount, {'from': user})

    # Verify correct balances
    assert ren_token.balanceOf(ren_pool) == amount
    assert ren_token.balanceOf(user) == user_init_balance - amount
    assert ren_pool.balanceOf(user) == amount
    assert ren_pool.totalPooled() == amount

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
def test_ren_pool_locking(ren_pool, ren_token, user):
    """
    Test pool locking after C.POOL_BOND deposit.
    """
    # User deposits 'C.POOL_BOND' into the pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': user})
    ren_pool.deposit(C.POOL_BOND, {'from': user})

    # Make sure the pool is locked
    assert ren_pool.isLocked() == True

# TODO: test remaining paths
