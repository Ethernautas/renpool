from brownie import chain, accounts, reverts
import pytest
import constants as C

connected_network: str = C.NETWORKS['MAINNET_FORK']
darknodeRegistryStoreAddr: str = C.CONTRACT_ADDRESSES[connected_network]['DARKNODE_REGISTRY_STORE']

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
def test_darknode_claim_rewards(owner, node_operator, ren_pool, ren_token, darknode_registry, user):
	"""
	Test darknode claim rewards.
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

	# TODO: query fees to claim

	# Claim fees passing amount and token symbol

# TODO: test remaining paths
