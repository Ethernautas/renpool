from brownie import ZERO_ADDRESS, network, accounts, config, RenPool
from brownie_tokens import MintableForkToken
from kovan_tokens.forked import MintableKovanForkToken
import pytest
import constants as C
import utils

"""
A fixture is a function that is applied to one or more test functions, and is called
prior to the execution of each test. Fixtures are used to setup the initial conditions
required for a test.

Fixtures are declared using the @pytest.fixture decorator. To pass a fixture to a test,
include the fixture name as an input argument for the test.

When pytest goes to run a test, it looks at the parameters in that test function’s
signature, and then searches for fixtures that have the same names as those parameters.
Once pytest finds them, it runs those fixtures, captures what they returned
(if anything), and passes those objects into the test function as arguments.

See: https://eth-brownie.readthedocs.io/en/stable/tests-pytest-intro.html#fixtures
"""

connected_network = config['networks']['default']
supported_networks = [C.NETWORKS['MAINNET_FORK'], C.NETWORKS['KOVAN_FORK']]

if connected_network not in supported_networks:
	raise ValueError(f'Unsupported network, switch to {str(supported_networks)}')

# Required due to this bug https://github.com/eth-brownie/brownie/issues/918
network.connect(connected_network)

ren_token_addr = C.CONTRACT_ADDRESSES[connected_network]['REN_TOKEN']
ren_BTC_addr: str = C.TOKEN_ADDRESSES[connected_network]['renBTC']
darknode_registry_addr = C.CONTRACT_ADDRESSES[connected_network]['DARKNODE_REGISTRY']
darknode_registry_store_addr = C.CONTRACT_ADDRESSES[connected_network]['DARKNODE_REGISTRY_STORE']
darknode_payment_addr = C.CONTRACT_ADDRESSES[connected_network]['DARKNODE_PAYMENT']
claim_rewards_addr = C.CONTRACT_ADDRESSES[connected_network]['CLAIM_REWARDS']
gateway_addr = C.CONTRACT_ADDRESSES[connected_network]['GATEWAY']

"""
A common pattern is to include one or more module-scoped setup fixtures that define
the initial test conditions, and then use fn_isolation to revert to this base state
at the start of each test.

See: https://eth-brownie.readthedocs.io/en/stable/tests-pytest-intro.html#isolation-fixtures
"""
@pytest.fixture(scope="module", autouse=True)
def shared_setup(module_isolation):
	"""
	Resetting the local environment.
	"""
	pass

@pytest.fixture(scope='module', autouse=True)
def ren_token():
	"""
	Yield a `Contract` object for the REN token contract.
	"""
	if connected_network == C.NETWORKS['MAINNET_FORK']:
		yield MintableForkToken(ren_token_addr)
	elif connected_network == C.NETWORKS['KOVAN_FORK']:
		yield MintableKovanForkToken(ren_token_addr)

@pytest.fixture(scope='module', autouse=True)
def ren_BTC():
	"""
	Yield a `Contract` object for the renBTC contract.
	"""
	yield utils.load_contract(ren_BTC_addr)

@pytest.fixture(scope='module', autouse=True)
def distribute_ren_tokens(ren_token):
	"""
	Set accounts initial balance to match C.POOL_BOND
	"""
	for i in range(0, 10):
		ren_token._mint_for_testing(accounts[i], C.POOL_BOND)

@pytest.fixture(scope='module')
def owner():
	"""
	Yield an `Account` object for the contract's owner.
	"""
	yield accounts[0]

@pytest.fixture(scope='module')
def node_operator():
	"""
	Yield an `Account` object for the contract's node operator.
	"""
	yield accounts[1]

@pytest.fixture(scope='module')
def darknode_registry():
	"""
	Yield a `Contract` object for the DarknodeRegistry contract.
	"""
	yield utils.load_contract(darknode_registry_addr)

@pytest.fixture(scope='module')
def darknode_registry_store():
	"""
	Yield a `Contract` object for the DarknodeRegistryStore contract.
	"""
	yield utils.load_contract(darknode_registry_store_addr)

@pytest.fixture(scope='module')
def darknode_payment():
	"""
	Yield a `Contract` object for the DarknodePayment contract.
	"""
	yield utils.load_contract(darknode_payment_addr)

@pytest.fixture(scope='module')
def ren_pool(owner, node_operator):
	"""
	Yield a `Contract` object for the RenPool contract.
	"""
	yield RenPool.deploy(
		ren_token_addr,
		darknode_registry_addr,
		darknode_payment_addr,
		claim_rewards_addr,
		gateway_addr,
		owner,
		C.POOL_BOND,
		{'from': node_operator},
	)

@pytest.fixture(autouse=True)
def setup(fn_isolation):
	"""
	Isolation setup fixture.
	This ensures that each test runs against the same base environment.
	"""
	pass

