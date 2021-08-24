from brownie import accounts
from brownie.test import given, strategy
import constants as C

@given(
    user=strategy('address', exclude = accounts[0]), # owner
    amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND),
)
def test_withdraw_fullfilment_happy_path(owner, ren_pool, ren_token, user, amount):
    """
    Test withdraw fulfillment happy path.
    """
    assert ren_pool.totalPooled() == 0
    assert ren_pool.isLocked() == False

    # Lock the pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
    ren_pool.deposit(C.POOL_BOND, {'from': owner})
    assert ren_pool.isLocked() == True
    assert ren_pool.totalPooled() == C.POOL_BOND

    # The pool is locked, now we can request withdraw
    ren_pool.requestWithdraw(amount, {'from': owner})
    assert ren_pool.withdrawRequests(owner) == amount

    # User fulfills the withdraw request made by the owner
    init_balance = ren_token.balanceOf(user)
    ren_token.transfer(user, amount, {'from': owner})
    ren_token.approve(ren_pool, amount , {'from': user})
    ren_pool.fulfillWithdrawRequest(owner, {'from': user})

    assert ren_token.balanceOf(user) == init_balance
    assert ren_pool.balanceOf(user) == amount
    assert ren_pool.isLocked() == True
    assert ren_pool.totalPooled() == C.POOL_BOND

# TODO: test remaining paths
