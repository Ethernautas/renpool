from brownie import accounts
from brownie.test import given, strategy
import constants as C

@given(
    user=strategy('address', exclude = accounts[0]), # owner
    amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND),
)
def test_ren_pool_withdraw_happy_path(owner, ren_pool, ren_token, user, amount):
    """
    Test withdraw happy path.
    """
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0

    init_balance = ren_token.balanceOf(user)
    ren_token.transfer(user, amount, {'from': owner})
    assert ren_token.balanceOf(user) == init_balance + amount

    ren_token.approve(ren_pool, amount, {'from': user})
    ren_pool.deposit(amount, {'from': user})
    assert ren_token.balanceOf(ren_pool) == amount
    assert ren_pool.balanceOf(user) == amount
    assert ren_pool.totalPooled() == amount

    ren_pool.withdraw(amount, {'from': user})
    assert ren_pool.balanceOf(user) == 0
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0
    assert ren_token.balanceOf(user) == init_balance + amount
