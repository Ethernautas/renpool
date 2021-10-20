from brownie.test import given, strategy
from brownie import accounts
import pytest
import constants as C


@pytest.mark.parametrize("user", accounts[0:3])  # [owner, nodeOperator, user]
@given(
    amount=strategy("uint256", min_value=1, max_value=C.POOL_BOND),
)
def test_ren_pool_withdraw(ren_pool, ren_token, user, amount):
    """
    Test withdraw happy path.
    """
    user_init_balance = ren_token.balanceOf(user)

    # User deposits 'amount' into the pool
    ren_token.approve(ren_pool, amount, {"from": user})
    ren_pool.deposit(amount, {"from": user})

    # User withdraws 'amount' from the pool
    ren_pool.withdraw(amount, {"from": user})

    # Verify final and initial balances match
    assert ren_token.balanceOf(ren_pool) == 0
    assert ren_token.balanceOf(user) == user_init_balance
    assert ren_pool.balanceOf(user) == 0
    assert ren_pool.totalPooled() == 0


# Test case when 'uint senderBalance = balances[sender];' is
# undefined for the given sender
