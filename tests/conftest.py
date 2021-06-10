import pytest


@pytest.fixture(autouse=True)
def setup(fn_isolation):
    """
    Isolation setup fixture.
    This ensures that each test runs against the same base environment.
    """
    pass

@pytest.fixture(scope="module")
def ren_token(accounts, ERC20):
    """
    Yield a `ERC20` object for the RenPool contract.
    """
    yield ERC20.deploy("REN", "REN", 18, 1e21, {'from': accounts[0]})

@pytest.fixture(scope="module")
def ren_pool(accounts, RenPool, ren_token):
    """
    Yield a `Contract` object for the RenPool contract.
    """
    yield RenPool.deploy(ren_token, {'from': accounts[0]})
