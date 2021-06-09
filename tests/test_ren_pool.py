def test_ren_pool_deploy(accounts, RenPool):
    """
    Test if the contract is correctly deployed.
    """
    assert RenPool.owner() == accounts[0]
    assert RenPool.total() == 0


def test_ren_pool_deposit(accounts, RenPool):
    """
    Test deposit.
    """
    DEPOSIT = 100
    assert RenPool.total() == 0
    RenPool.deposit(DEPOSIT, {'from': accounts[0]})
    assert RenPool.balanceOf(accounts[0], {'from': accounts[0]}) == DEPOSIT
    assert RenPool.total() == DEPOSIT
