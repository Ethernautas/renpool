import constants as C

def test_ren_pool_deploy(owner, admin, ren_pool):
    """
    Test if the contract is correctly deployed.
    """
    assert ren_pool.owner() == owner
    assert ren_pool.admin() == admin
    assert ren_pool.bond() == C.POOL_BOND
    assert ren_pool.isLocked() == False
    assert ren_pool.totalPooled() == 0
