from brownie import chain
import pytest
import constants as C

net = C.NETWORKS['MAINNET_FORK']
darknodeRegistryStoreAddr = C.CONTRACT_ADDRESSES[net]['DARKNODE_REGISTRY_STORE']

def test_darknode_registration_happy_path(owner, node_operator, ren_pool, ren_token, darknode_registry):
    """
    Test darknode registration happy path.
    """
    chain.snapshot()

    assert ren_pool.totalPooled() == 0
    assert ren_pool.isLocked() == False

    # Lock the pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
    ren_pool.deposit(C.POOL_BOND, {'from': owner})
    assert ren_pool.isLocked() == True
    assert ren_pool.totalPooled() == C.POOL_BOND

    init_balance = ren_token.balanceOf(darknodeRegistryStoreAddr)

    # Register darknode
    ren_pool.approveBondTransfer({'from': node_operator})
    ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': node_operator})

    # Funds are stored in the DarknodeRegistryStore contract instead of the DarknodeRegistry
    assert ren_token.balanceOf(darknodeRegistryStoreAddr) == init_balance + C.POOL_BOND
    assert ren_token.balanceOf(ren_pool) == 0
    assert darknode_registry.isPendingRegistration(C.NODE_ID_HEX) == True
    assert darknode_registry.isRegistered(C.NODE_ID_HEX) == False

    # Skip to the next epoch (1 month) for the registration to settle
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    assert darknode_registry.isPendingRegistration(C.NODE_ID_HEX) == False
    assert darknode_registry.isRegistered(C.NODE_ID_HEX) == True

def test_darknode_registration_ownership(owner, node_operator, ren_pool, ren_token, darknode_registry):
    """
    Test darknode registration ownership.
    """
    chain.snapshot()

    # Lock the pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
    ren_pool.deposit(C.POOL_BOND, {'from': owner})

    # Register darknode
    ren_pool.approveBondTransfer({'from': node_operator})
    ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': node_operator})

    # Skip to the next epoch (1 month) for the registration to settle
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    # Make sure RenPool is the account that registered a darknode and not the node operator
    assert darknode_registry.getDarknodeOperator(C.NODE_ID_HEX) == ren_pool
    assert darknode_registry.getDarknodeOperator(C.NODE_ID_HEX) != node_operator

# TODO: test remaining paths
# def test_darknode_registration_fails_if_unapproved(owner, node_operator, ren_pool, ren_token):
#     """
#     Test node registration fails if unapproved.
#     """
#     assert ren_pool.totalPooled() == 0
#     assert ren_pool.isLocked() == False

#     # Lock the pool
#     ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
#     ren_pool.deposit(C.POOL_BOND, {'from': owner})
#     assert ren_pool.isLocked() == True
#     assert ren_pool.totalPooled() == C.POOL_BOND

#     init_balance = ren_token.balanceOf(darknodeRegistryStoreAddr)

#     # ren_pool.approveBondTransfer({'from': node_operator})
#     ren_pool.registerDarknode(NODE_ID, PUBLIC_KEY, {'from': node_operator})

#     # assert ren_token.balanceOf(darknodeRegistryStoreAddr) == init_balance + C.POOL_BOND
#     # assert ren_token.balanceOf(ren_pool) == 0
