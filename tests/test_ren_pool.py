
def test_ren_pool_deploy(ren_pool):
    """
    Test if the contract is correctly deployed.
    """
    assert ren_pool.get() == 10


def test_ren_pool_set(accounts, ren_pool):
    """
    Test if the storage variable can be changed.
    """
    ren_pool.set(30, {'from': accounts[0]})
    assert ren_pool.get() == 30
