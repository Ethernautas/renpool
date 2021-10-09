from brownie import chain, accounts
import pytest
import constants as C

net = C.NETWORKS['MAINNET_FORK']
darknodeRegistryStoreAddr = C.CONTRACT_ADDRESSES[net]['DARKNODE_REGISTRY_STORE']

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
def test_darknode_deregistration(node_operator, ren_pool, ren_token, darknode_registry, user):
	"""
	Test darknode deregistration.
	"""
	chain.snapshot()

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
	ren_pool.deregisterDarknode({'from': node_operator})

	# Make sure the darknode is under the 'pending deregistration' state
	assert darknode_registry.isPendingDeregistration(C.NODE_ID_HEX) == True

	# Skip to the next epoch (1 month) for the deregistration to settle
	chain.mine(timedelta = C.ONE_MONTH)
	darknode_registry.epoch({'from': ren_pool})

	# Make sure the darknode is now under the 'deregistered' state
	assert darknode_registry.isDeregistered(C.NODE_ID_HEX) == True

	# Make sure darknodeID and publicKey variables have the correct values
	assert ren_pool.darknodeID() == C.NODE_ID_HEX
	assert ren_pool.publicKey() == C.PUBLIC_KEY
