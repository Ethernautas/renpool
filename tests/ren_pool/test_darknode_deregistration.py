from brownie import chain
import constants as C

net = C.NETWORKS['MAINNET_FORK']
darknodeRegistryStoreAddr = C.CONTRACT_ADDRESSES[net]['DARKNODE_REGISTRY_STORE']

def test_darknode_deregistration_happy_path(owner, node_operator, ren_pool, ren_token, darknode_registry):
    """
    Test darknode deregistration happy path.
    """
    chain.snapshot()

    # Lock the pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
    ren_pool.deposit(C.POOL_BOND, {'from': owner})

    # Registering the darknode
    ren_pool.approveBondTransfer({'from': node_operator})
    ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': node_operator})

    # Skip to the next epoch (1 month) for the registration to settle
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    # Deregister the darknode and skip to the next epoch
    ren_pool.deregister(C.NODE_ID_HEX, {'from': node_operator})
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    assert darknode_registry.isPendingRegistration(C.NODE_ID_HEX) == False
    assert darknode_registry.isRegistered(C.NODE_ID_HEX) == True
