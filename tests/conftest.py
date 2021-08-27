from brownie import network, accounts, config, RenPool
from brownie_tokens import MintableForkToken
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

net = C.NETWORKS['MAINNET_FORK']
renTokenAddr = C.CONTRACT_ADDRESSES[net]['REN_TOKEN']
darknodeRegistryAddr = C.CONTRACT_ADDRESSES[net]['DARKNODE_REGISTRY']
darknodeRegistryStoreAddr = C.CONTRACT_ADDRESSES[net]['DARKNODE_REGISTRY_STORE']

if config['networks']['default'] != net:
  raise ValueError(f'Unsupported network, switch to {net}')

# Required due to this bug https://github.com/eth-brownie/brownie/issues/918
network.connect(net)

@pytest.fixture(autouse=True)
def setup(fn_isolation):
    """
    Isolation setup fixture.
    This ensures that each test runs against the same base environment.
    """
    pass

@pytest.fixture(scope="module")
def owner():
    """
    Yield an `Account` object for the contract's owner.
    """
    yield accounts[0]

@pytest.fixture(scope="module")
def node_operator():
    """
    Yield an `Account` object for the contract's node operator.
    """
    yield accounts[1]

@pytest.fixture(scope="module")
def ren_token(owner):
    """
    Yield a `Contract` object for the RenToken contract.
    """
    renToken = MintableForkToken(renTokenAddr)
    renToken._mint_for_testing(owner, 2 * C.POOL_BOND)
    yield renToken

@pytest.fixture(scope="module")
def darknode_registry():
    """
    Yield a `Contract` object for the DarknodeRegistrycontract.
    """
    yield utils.load_contract(darknodeRegistryAddr)

@pytest.fixture(scope="module")
def darknode_registry_store():
    """
    Yield a `Contract` object for the DarknodeRegistryStore contract.
    """
    yield utils.load_contract(darknodeRegistryStoreAddr)

@pytest.fixture(scope="module")
def ren_pool(owner, node_operator):
    """
    Yield a `Contract` object for the RenPool contract.
    """
    yield RenPool.deploy(
        renTokenAddr,
        darknodeRegistryAddr,
        owner,
        C.POOL_BOND,
        {'from': node_operator},
    )
