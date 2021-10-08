from brownie import accounts, config, RenPool, Contract
from brownie.network.account import Account
from brownie_tokens import MintableForkToken
from kovan_tokens.forked import MintableKovanForkToken
import constants as C

def main():
	"""
	Deploy a RenPool contract to the mainnet-fork, lock the
	pool by providing liquidity and finally register a
	darknode instance.
	See: https://youtu.be/0JrDbvBClEA (brownie tutorial)
	See: https://renproject.github.io/contracts-ts/#/mainnet
	"""

	connected_network: str = config['networks']['default']
	supported_networks: list[str] = [C.NETWORKS['MAINNET_FORK'], C.NETWORKS['KOVAN_FORK']]

	if connected_network not in supported_networks:
		raise ValueError(f'Unsupported network, switch to {str(supported_networks)}')

	owner: Account = accounts[0]
	nodeOperator: Account = accounts[1]
	user: Account = accounts[2]

	renTokenAddr: str = C.CONTRACT_ADDRESSES[connected_network]['REN_TOKEN']
	darknodeRegistryAddr: str = C.CONTRACT_ADDRESSES[connected_network]['DARKNODE_REGISTRY']
	darknodeRegistryStoreAddr: str = C.CONTRACT_ADDRESSES[connected_network]['DARKNODE_REGISTRY_STORE']
	claimRewardsAddr: str = C.CONTRACT_ADDRESSES[connected_network]['CLAIM_REWARDS']
	gatewayAddr: str = C.CONTRACT_ADDRESSES[connected_network]['GATEWAY']

	renPool: Contract = RenPool.deploy(
		renTokenAddr,
		darknodeRegistryAddr,
		claimRewardsAddr,
		gatewayAddr,
		owner,
		C.POOL_BOND,
		{'from': nodeOperator}
	)

	renToken: Contract = None

	if connected_network == C.NETWORKS['MAINNET_FORK']:
		renToken = MintableForkToken(renTokenAddr)
	elif connected_network == C.NETWORKS['KOVAN_FORK']:
		renToken = MintableKovanForkToken(renTokenAddr)

	renToken._mint_for_testing(user, C.POOL_BOND)

	renToken.approve(renPool, C.POOL_BOND, {'from': user})
	renPool.deposit(C.POOL_BOND, {'from': user})

	if renPool.isLocked() != True:
		raise ValueError('Pool is not locked')

	renPool.approveBondTransfer({'from': nodeOperator})
	renPool.registerDarknode(user, 'some_public_key', {'from': nodeOperator})

	return renToken, renPool
