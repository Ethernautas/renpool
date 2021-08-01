from brownie import *
import pytest


""" !!!Setting up tests!!! """
@pytest.fixture(scope="module")
def ren_token(accounts, RenToken):
    """Deploying RenToken"""
    yield RenToken.deploy({'from': accounts[0]})
    
@pytest.fixture(scope="module")
def ren_pool(accounts, RenPool, ren_token):
    """Deploying RenPool"""
    yield RenPool.deploy(ren_token, {'from': accounts[0]})


""" !!!Testing!!! """
def test_ren_symbol(accounts, ren_token):
    """
    Test REN token has the correct symbol.
    """
    assert ren_token.symbol() == 'REN'

def test_ren_pool_deploy(accounts, ren_pool):
    """
    Test if the contract is correctly deployed.
    """
    assert ren_pool.owner() == accounts[0]
    assert ren_pool.totalPooled() == 0
    
def test_ren_token_faucet(accounts, ren_token):
    """Testing faucet"""
    ren_token.getFromFaucet({'from': accounts[1]})
    assert ren_token.balanceOf(accounts[1]) == 1000 * 10**18
    
def test_ren_pool_deposit(accounts, ren_pool, ren_token):
    DEPOSIT = 100
    assert ren_pool.totalPooled() == 0
    ren_token.approve(ren_pool.address, DEPOSIT, {'from': accounts[0]})
    ren_pool.deposit(DEPOSIT, {'from': accounts[0]})
    assert ren_token.balanceOf(ren_pool.address, {'from': accounts[0]}) == DEPOSIT
    assert ren_pool.balanceOf(accounts[0], {'from': accounts[0]}) == DEPOSIT
    assert ren_pool.totalPooled() == DEPOSIT

def test_ren_pool_withdraw(accounts, ren_pool, ren_token):
    DEPOSIT = 100
    assert ren_pool.totalPooled() == 0
    ren_token.approve(ren_pool.address, DEPOSIT, {'from': accounts[0]})
    ren_pool.deposit(DEPOSIT, {'from': accounts[0]})
    assert ren_token.balanceOf(ren_pool.address, {'from': accounts[0]}) == DEPOSIT
    assert ren_pool.balanceOf(accounts[0], {'from': accounts[0]}) == DEPOSIT
    assert ren_pool.totalPooled() == DEPOSIT

    ren_pool.withdraw(DEPOSIT, {'from': accounts[0]})
    assert ren_pool.balanceOf(accounts[0], {'from': accounts[0]}) == 0
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool.address, {'from': accounts[0]}) == 0


def test_withdraw_request(accounts, ren_pool, ren_token):
    DEPOSIT = 100# Pool locked
    ren_token.approve(ren_pool.address, DEPOSIT, {'from': accounts[0]})
    ren_pool.deposit(DEPOSIT, {'from': accounts[0]})
    assert ren_pool.isLocked() == True