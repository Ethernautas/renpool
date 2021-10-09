from brownie import chain, accounts, reverts
import pytest
import constants as C

connected_network: str = C.NETWORKS['MAINNET_FORK']
ren_BTC_addr: str = C.TOKEN_ADDRESSES[connected_network]['renBTC']

@pytest.mark.parametrize('user', accounts[0:3]) # [owner, nodeOperator, user]
def test_darknode_claim_rewards(
	node_operator,
	ren_pool,
	ren_token,
	darknode_registry,
	user,
):
	"""
	Test transfering rewards from the REN protocol to the given address.
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

	# Skip to the next epoch to make sure we have fees to claim
	chain.mine(timedelta = C.ONE_MONTH)

	# Transfer fees from darknode to the darknode's owner account on the REN protocol
	ren_pool.transferRewardsToDarknodeOwner([ren_BTC_addr])
	# Is there any way to test this?

	ren_pool.claimDarknodeRewards()

# TODO: test remaining paths
