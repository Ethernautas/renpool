from brownie import *
import pytest


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


def test_pool_locking(accounts, ren_pool, ren_token):
    # Depositing 100k in the pool to lock it
    DEPOSIT = 100000*10**18
    assert ren_pool.totalPooled() == 0
    print(ren_token.balanceOf(accounts[0]))
    ren_token.approve(ren_pool.address, DEPOSIT, {'from': accounts[0]})
    ren_pool.deposit(DEPOSIT, {'from': accounts[0]})
    
    assert ren_pool.isLocked() == True
    

def test_withdraw_request(accounts, ren_pool, ren_token):
    # Depositing 100k in the pool to lock it
    DEPOSIT = 100000*10**18
    assert ren_pool.totalPooled() == 0
    print(ren_token.balanceOf(accounts[0]))

    ren_token.approve(ren_pool.address, DEPOSIT, {'from': accounts[0]})
    ren_pool.deposit(DEPOSIT, {'from': accounts[0]})
    
    WITHDRAW_AMOUNT = 1000*10**18
    ren_pool.withdraw(WITHDRAW_AMOUNT, {'from': accounts[0]})

    assert ren_pool.totalPooled() == 100000*10**18
    assert ren_pool.withdrawRequests(0) # seeing if there is a withdraw request
    

def test_withdraw_fullfulment(accounts, ren_pool, ren_token):
    # Depositing 100k in the pool to lock it
    DEPOSIT = 100000*10**18
    assert ren_pool.totalPooled() == 0
    print(ren_token.balanceOf(accounts[0]))

    ren_token.approve(ren_pool.address, DEPOSIT, {'from': accounts[0]})
    ren_pool.deposit(DEPOSIT, {'from': accounts[0]})
    
    WITHDRAW_AMOUNT = 1000*10**18
    ren_pool.withdraw(WITHDRAW_AMOUNT, {'from': accounts[0]})

    assert ren_pool.totalPooled() == 100000*10**18
    assert ren_pool.withdrawRequests(0) # seeing if there is a withdraw request
    
    # Fullfilling
    ren_token.transfer(accounts[1], 1000*10**18, {'from': accounts[0]})
    assert ren_token.balanceOf(accounts[1], {'from': accounts[1]}) == 1000*10**18 # Account 1 has 1k REN
    
    # Account 1 fullfills the withdraw request
    ren_token.approve(ren_pool.address, 1000*10**18 , {'from': accounts[1]})
    ren_pool.fullfillWithdrawRequest(0, {'from': accounts[1]})
    
    assert ren_token.balanceOf(accounts[1], {'from': accounts[1]}) == 0 # Account has fullfiled the withdraw request
    assert ren_pool.totalPooled() == 100000*10**18 # Pool still full


    
    
    