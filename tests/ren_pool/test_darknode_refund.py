from brownie import chain, accounts
import pytest
import constants as C

net = C.NETWORKS['MAINNET_FORK']
darknodeRegistryStoreAddr = C.CONTRACT_ADDRESSES[net]['DARKNODE_REGISTRY_STORE']

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
def test_darknode_refund(node_operator, ren_pool, ren_token, darknode_registry, user):
    """
    Test darknode refund happy path.
    """
    chain.snapshot()

    registry_store_init_balance = ren_token.balanceOf(darknodeRegistryStoreAddr)
    user_init_balance = ren_token.balanceOf(user)

    # Lock pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': user})
    ren_pool.deposit(C.POOL_BOND, {'from': user})

    # Register darknode
    ren_pool.approveBondTransfer({'from': node_operator})
    ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': node_operator})

    # Skip to the next epoch (1 month) for the registration to settle
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    # Make sure the darknode is under the 'registered' state
    assert darknode_registry.isRegistered(C.NODE_ID_HEX) == True

    # Deregister darknode
    ren_pool.deregister({'from': node_operator})

    # Make sure the darknode is under the 'pending deregistration' state
    assert darknode_registry.isPendingDeregistration(C.NODE_ID_HEX) == True

    # Skip to the next epoch (1 month) for the deregistration to settle
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    # Make sure the darknode is now under the 'deregistered' state
    assert darknode_registry.isDeregistered(C.NODE_ID_HEX) == True

    # Skip one extra epoch for the refund to be callable
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    # Call refund
    ren_pool.refund({'from': node_operator})

    # Make sure funds are back into the RenPool contract
    assert ren_token.balanceOf(darknodeRegistryStoreAddr) == registry_store_init_balance
    assert ren_token.balanceOf(ren_pool) == C.POOL_BOND

    # Unlock pool to release funds
    ren_pool.unlockPool({'from': node_operator})
    assert ren_pool.isLocked() == False

    # Refund staker(s)
    ren_pool.withdraw(C.POOL_BOND, {'from': user})
    assert ren_token.balanceOf(user) == user_init_balance
