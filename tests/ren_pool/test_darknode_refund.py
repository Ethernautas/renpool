from brownie import chain
import constants as C

net = C.NETWORKS['MAINNET_FORK']
darknodeRegistryStoreAddr = C.CONTRACT_ADDRESSES[net]['DARKNODE_REGISTRY_STORE']

def test_darknode_refund_happy_path(owner, node_operator, ren_pool, ren_token, darknode_registry):
    """
    Test darknode refund happy path.
    """
    chain.snapshot()

    init_balance = ren_token.balanceOf(darknodeRegistryStoreAddr)

    # Lock the pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
    ren_pool.deposit(C.POOL_BOND, {'from': owner})

    # Register darknode
    ren_pool.approveBondTransfer({'from': node_operator})
    ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': node_operator})

    # Skip to the next epoch for the registration to settle
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    # Deregister darknode
    ren_pool.deregister(C.NODE_ID_HEX, {'from': node_operator})

    # Skip to the next epoch  for the deregistration to settle
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    assert darknode_registry.isDeregistered(C.NODE_ID_HEX) == True

    # Skip one extra epoch for the refund to be callable
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})
    ren_pool.refund(C.NODE_ID_HEX, {'from': node_operator})

    assert ren_token.balanceOf(darknodeRegistryStoreAddr) == init_balance
    assert ren_token.balanceOf(ren_pool) == C.POOL_BOND
