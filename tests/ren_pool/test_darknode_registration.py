from brownie import chain, accounts, reverts
import pytest
import constants as C

connected_network: str = C.NETWORKS['MAINNET_FORK']
darknodeRegistryStoreAddr: str = C.CONTRACT_ADDRESSES[connected_network]['DARKNODE_REGISTRY_STORE']

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

	# Make sure darknodeID and publicKey were stored correctly inside the pool
	assert ren_pool.darknodeID() == C.NODE_ID_HEX
	assert ren_pool.publicKey() == C.PUBLIC_KEY

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

@pytest.mark.parametrize('user', [accounts[i] for i in [0,2]]) # [owner, user]
def test_darknode_registration_not_node_operator(node_operator, ren_pool, ren_token, user):
	"""
	Test that darknode registration fails when user is not the node operator.
	"""
	# Make sure user is not the node operator
	assert user != node_operator

	# Lock pool
	ren_token.approve(ren_pool, C.POOL_BOND, {'from': user})
	ren_pool.deposit(C.POOL_BOND, {'from': user})

	# Node operator approves transfer
	ren_pool.approveBondTransfer({'from': node_operator})

	# Attempt to register darknode when caller is not node operator
	with reverts('Caller is not nodeOperator'):
		ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': user})

def test_darknode_registration_twice(owner, node_operator, ren_pool, ren_token):
	"""
	Test calling darknode registration twice.
	"""
	# Lock pool
	ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
	ren_pool.deposit(C.POOL_BOND, {'from': owner})

	# Register darknode
	ren_pool.approveBondTransfer({'from': node_operator})
	ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': node_operator})

	# Attempt to register darknode twice should fail
	with reverts(''):
		ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': node_operator})

def test_darknode_registration_twice_diff_node_id(owner, node_operator, ren_pool, ren_token):
	"""
	Test calling darknode registration twice with a different darknodeID.
	"""
	# Lock pool
	ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
	ren_pool.deposit(C.POOL_BOND, {'from': owner})

	# Register darknode
	ren_pool.approveBondTransfer({'from': node_operator})
	ren_pool.registerDarknode(C.NODE_ID_HEX, C.PUBLIC_KEY, {'from': node_operator})

	# Attempt to register darknode twice should fail
	with reverts(''):
		ren_pool.registerDarknode(C.NODE_ID_2_HEX, C.PUBLIC_KEY_2, {'from': node_operator})

	# Make sure initial darknodeID and publicKey are preserved
	assert ren_pool.darknodeID() == C.NODE_ID_HEX
	assert ren_pool.publicKey() == C.PUBLIC_KEY

# TODO: test remaining paths
