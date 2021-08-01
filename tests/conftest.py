import pytest

DECIMALS = 18
POOL_TARGET = 100_000 * 10 ** DECIMALS
# ^ TODO: try to move these constants to a constants file so that we can import them

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
    Yield an `Account` object for the owner of the contracts.
    """
    yield accounts[0]

@pytest.fixture(scope="module")
def ren_token(owner, RenToken):
    """
    Yield a `Contract` object for the RenToken contract.
    """
    yield RenToken.deploy({'from': owner})

@pytest.fixture(scope="module")
def ren_pool(owner, RenPool, ren_token):
    """
    Yield a `Contract` object for the RenPool contract.
    """
    yield RenPool.deploy(ren_token, owner, POOL_TARGET, {'from': owner})
