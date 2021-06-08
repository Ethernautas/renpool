def test_ren_pool_deploy(accounts, ren_pool):
    """
    Test if the contract is correctly deployed.
    """
    assert ren_pool.owner() == accounts[0]
    assert ren_pool.totalBalance() == 0


def test_ren_pool_deposit(accounts, ren_pool):
    """
    Test deposit.
    """
    DEPOSIT = 100
    ren_pool.deposit(DEPOSIT, {'from': accounts[0]})
    assert ren_pool.balanceOf(accounts[0], {'from': accounts[0]}) == DEPOSIT
