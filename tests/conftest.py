import pytest


@pytest.fixture(autouse=True)
def setup(fn_isolation):
    """
    Isolation setup fixture.
    This ensures that each test runs against the same base environment.
    """
    pass


@pytest.fixture(scope="module")
def ren_pool(accounts, RenPool):
    """
    Yield a `Contract` object for the RenPool contract.
    """
    yield accounts[0].deploy(RenPool)
