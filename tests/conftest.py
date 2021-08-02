import pytest
from brownie import *
import scripts.deploy as deployer

@pytest.fixture(autouse=True)
def setup(fn_isolation):
    """
    Isolation setup fixture.
    This ensures that each test runs against the same base environment.
    """

    pass


@pytest.fixture(scope="module")
def ren_token(accounts, RenToken):

    yield RenToken.deploy({'from': accounts[0]})
@pytest.fixture(scope="module")
def ren_pool(accounts, RenPool, ren_token):

    yield RenPool.deploy(ren_token, {'from': accounts[0]})
