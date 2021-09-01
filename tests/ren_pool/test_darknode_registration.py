from brownie import chain, accounts
import pytest
import constants as C

net = C.NETWORKS['MAINNET_FORK']
darknodeRegistryStoreAddr = C.CONTRACT_ADDRESSES[net]['DARKNODE_REGISTRY_STORE']

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
def test_darknode_registration(owner, node_operator, ren_pool, ren_token, darknode_registry, user):
    """
    Test darknode registration and ownership.
    """
    chain.snapshot()

    registry_store_init_balance = ren_token.balanceOf(darknodeRegistryStoreAddr)

    # Lock pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': user})
    ren_pool.deposit(C.POOL_BOND, {'from': user})

    # Register darknode
    ren_pool.approveBondTransfer({'from': node_operator})
    ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': node_operator})

    # Make sure funds are transferred to the DarknodeRegistryStore contract
    # and the darknode is under 'pending registration' state
    assert ren_token.balanceOf(darknodeRegistryStoreAddr) == registry_store_init_balance + C.POOL_BOND
    assert ren_token.balanceOf(ren_pool) == 0
    assert darknode_registry.isPendingRegistration(C.NODE_ID_HEX) == True
    assert darknode_registry.isRegistered(C.NODE_ID_HEX) == False

    # Skip to the next epoch (1 month) for the registration to settle
    chain.mine(timedelta = C.ONE_MONTH)
    darknode_registry.epoch({'from': ren_pool})

    # Make sure the darknode is now under the 'registered' state
    assert darknode_registry.isPendingRegistration(C.NODE_ID_HEX) == False
    assert darknode_registry.isRegistered(C.NODE_ID_HEX) == True

    # Make sure the darknode is registered under the RenPool address and not
    # the node operator nor the owner
    assert darknode_registry.getDarknodeOperator(C.NODE_ID_HEX) == ren_pool
    assert darknode_registry.getDarknodeOperator(C.NODE_ID_HEX) != owner
    assert darknode_registry.getDarknodeOperator(C.NODE_ID_HEX) != node_operator

# TODO: test remaining paths
