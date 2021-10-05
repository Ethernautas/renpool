from brownie.test import given, strategy
from brownie import accounts
import pytest
import constants as C

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
def test_initial_state(ren_pool, ren_token, user):
    """
    Test pool and accounts initial state.
    """
    # Make sure user has the correct initial balance.
    # See distribute_tokens fixture for initial token allocation.
    assert ren_token.balanceOf(user) == C.POOL_BOND

    # Make sure pool is empty
    assert ren_token.balanceOf(ren_pool) == 0
    assert ren_pool.totalPooled() == 0
