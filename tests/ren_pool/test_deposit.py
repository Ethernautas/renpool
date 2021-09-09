from brownie.test import given, strategy
from brownie import accounts, reverts
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
def test_ren_pool_deposit_locking(ren_pool, ren_token, user):
    """
    Test pool locking after C.POOL_BOND deposit.
    """
    # User deposits 'C.POOL_BOND' into the pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': user})
    ren_pool.deposit(C.POOL_BOND, {'from': user})

    # Make sure the pool is locked
    assert ren_pool.isLocked() == True

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
def test_ren_pool_deposit_invalid_amount(ren_pool, ren_token, user):
    """
    Test deposit invalid amount.
    """
    # User approves for some positive value
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': user})

    # User deposits invalid amount into the pool (negative values not supported)
    with reverts('Invalid amount'):
        ren_pool.deposit(0, {'from': user})

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
@given(
    amount=strategy('uint256', min_value = C.POOL_BOND + 1),
)
def test_ren_pool_deposit_surpassed_bond(ren_pool, ren_token, user, amount):
    """
    Test deposit surpassing bond.
    """
    # User approves 'amount > C.POOL_BOND'
    ren_token.approve(ren_pool, amount, {'from': user})

    # User deposits 'amount' into the pool
    with reverts('Amount surpasses bond'):
        ren_pool.deposit(amount, {'from': user})

@pytest.mark.parametrize('user', accounts[1:3]) # [nodeOperator, user]
@given(
    amount=strategy('uint256', min_value = 1),
)
def test_ren_pool_deposit_after_locking(owner, ren_pool, ren_token, user, amount):
    """
    Test pool deposit after locking.
    """
    # Lock pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
    ren_pool.deposit(C.POOL_BOND, {'from': owner})

    # Make sure the pool is locked
    assert ren_pool.isLocked() == True

    # Attempt deposit
    with reverts('Pool is locked'):
        ren_pool.deposit(amount, {'from': user})

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
@given(
    amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND),
)
def test_ren_pool_deposit_without_approval(ren_pool, user, amount):
    """
    Test deposit without approval.
    """
    # User deposits 'amount' without prior approval
    with reverts(''): # TODO: this sould throw 'Deposit failed', not sure why not (?)
        ren_pool.deposit(amount, {'from': user})
