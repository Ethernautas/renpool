from brownie.test import given, strategy
import constants as C

@given(
    user=strategy('address'),
    amount=strategy('uint256', min_value = 1, max_value = C.POOL_BOND),
)
def test_ren_pool_deposit_happy_path(owner, ren_pool, ren_token, user, amount):
    """
    Test deposit happy path.
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

# TODO: test remaining paths
