from brownie.test import given, strategy
from brownie import accounts
import pytest
import constants as C

@pytest.mark.parametrize('user', accounts[1:3]) # [nodeOperator, user]
@given(
	amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND),
)
def test_withdraw_fullfilment_happy_path(owner, ren_pool, ren_token, user, amount):
	"""
	Test withdraw fulfillment.
	"""
	user_init_balance = ren_token.balanceOf(user)

	# Owner locks pool (could be any other user)
	ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
	ren_pool.deposit(C.POOL_BOND, {'from': owner})

	# The pool is locked. We can now request withdraw
	ren_pool.requestWithdraw(amount, {'from': owner})

	# Make sure the withdraw request exists
	assert ren_pool.withdrawRequests(owner) == amount

	# User fulfills the withdraw request made by the owner
	ren_token.approve(ren_pool, amount , {'from': user})
	ren_pool.fulfillWithdrawRequest(owner, {'from': user})

	# Make sure balances are correct and pool is still locked
	assert ren_token.balanceOf(user) == user_init_balance - amount
	assert ren_pool.balanceOf(user) == amount
	assert ren_pool.isLocked() == True
	assert ren_pool.totalPooled() == C.POOL_BOND

# TODO: test remaining paths
