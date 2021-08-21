from brownie import accounts
from brownie.test import given, strategy
import constants as C

def test_ren_mint(owner, ren_token):
    """
    Test REN tokens are properly minted.
    """
    assert ren_token.balanceOf(owner) == 2 * C.POOL_BOND

def test_ren_symbol(ren_token):
    """
    Test REN token has the correct symbol.
    """
    assert ren_token.symbol() == 'REN'

def test_ren_pool_deploy(owner, admin, ren_pool):
    """
    Test if the contract is correctly deployed.
    """
    assert ren_pool.owner() == owner
    assert ren_pool.admin() == admin
    assert ren_pool.bond() == C.POOL_BOND
    assert ren_pool.isLocked() == False
    assert ren_pool.totalPooled() == 0

@given(
    user=strategy('address'),
    amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND)
)
def test_ren_pool_deposit(owner, ren_pool, ren_token, user, amount):
    """
    Test deposit.
    """
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0

    ren_token.transfer(user, amount, {'from': owner})
    assert ren_token.balanceOf(user) >= amount

    ren_token.approve(ren_pool, amount, {'from': user})
    ren_pool.deposit(amount, {'from': user})
    assert ren_token.balanceOf(ren_pool) == amount
    assert ren_pool.balanceOf(user) == amount
    assert ren_pool.totalPooled() == amount

@given(
    user=strategy('address', exclude = accounts[0]), # owner
    amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND)
)
def test_ren_pool_withdraw(owner, ren_pool, ren_token, user, amount):
    """
    Test withdraw.
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

@given(
    user=strategy('address', exclude = accounts[0]), # owner
    amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND)
)
def test_withdraw_fullfilment(owner, ren_pool, ren_token, user, amount):
    """
    Test withdraw fulfillment.
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
