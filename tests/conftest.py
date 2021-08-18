from brownie import ZERO_ADDRESS, accounts, config, RenToken, RenPool
import pytest
import constants as C

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

network = config['networks']['default']

if (network != 'development'):
  raise ValueError('Unsupported network, switch to development')

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
def admin():
    """
    Yield an `Account` object for the contract's admin.
    """
    yield accounts[1]

@pytest.fixture(scope="module")
def user():
    """
    Yield an `Account` object for the contract's user.
    """
    yield accounts[2]

@pytest.fixture(scope="module")
def ren_token(owner ):
    """
    Yield a `Contract` object for the RenToken contract.
    """
    yield RenToken.deploy({'from': owner})

@pytest.fixture(scope="module")
def ren_pool(owner, admin, ren_token):
    """
    Yield a `Contract` object for the RenPool contract.
    """
    yield RenPool.deploy(ren_token, ZERO_ADDRESS, owner, C.POOL_BOND, {'from': admin})
