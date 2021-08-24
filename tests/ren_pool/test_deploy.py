import constants as C

def test_ren_pool_deploy(owner, node_operator, ren_pool):
    """
    Test if the contract is correctly deployed.
    """
    assert ren_pool.owner() == owner
    assert ren_pool.nodeOperator() == node_operator
    assert ren_pool.bond() == C.POOL_BOND
    assert ren_pool.isLocked() == False
    assert ren_pool.totalPooled() == 0
