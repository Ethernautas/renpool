import pytest
import constants as C

@pytest.fixture(autouse=True)
def setup(fn_isolation):
    """
    Isolation setup fixture.
    This ensures that each test runs against the same base environment.
    """
    pass

@pytest.fixture(scope="module")
def owner(accounts):
    """
    Yield an `Account` object for the contract's owner.
    """
    yield accounts[0]

@pytest.fixture(scope="module")
def admin(accounts):
    """
    Yield an `Account` object for the contract's admin.
    """
    yield accounts[1]

@pytest.fixture(scope="module")
def user(accounts):
    """
    Yield an `Account` object for the contract's user.
    """
    yield accounts[2]

@pytest.fixture(scope="module")
def ren_token(owner, RenToken):
    """
    Yield a `Contract` object for the RenToken contract.
    """
    yield RenToken.deploy({'from': owner})

@pytest.fixture(scope="module")
def ren_pool(owner, admin, RenPool, ren_token):
    """
    Yield a `Contract` object for the RenPool contract.
    """
    yield RenPool.deploy(ren_token, owner, C.POOL_TARGET, {'from': admin})
