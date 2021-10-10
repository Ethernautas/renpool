from brownie.test import given, strategy
from brownie import accounts
import pytest
import constants as C

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
@given(
    amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND),
)
def test_ren_pool_withdraw_cancellation(ren_pool, ren_token, user, amount, owner):
    """
    Test withdraw cancellation happy path.
    """
    # Owner locks pool (could be any other user)
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
    ren_pool.deposit(C.POOL_BOND, {'from': owner})

    # The pool is locked. We can now request withdraw
    ren_pool.requestWithdraw(amount, {'from': user})

    # Make sure the withdraw request exists
    assert ren_pool.withdrawRequests(user) == amount
    
    # Delete the withdraw request
    ren_pool.cancelWithdrawRequest({'from': user})
    
    # Make sure the withdraw request does not exist anymore
    assert ren_pool.withdrawRequests(user) == None
