import constants as C

def test_ren_mint(owner, ren_token):
    """
    Test REN tokens are properly minted.
    """
    assert ren_token.balanceOf(owner) == C.INITIAL_SUPPLY

def test_ren_symbol(ren_token):
    """
    Test REN token has the correct symbol.
    """
    assert ren_token.symbol() == 'REN'

def test_ren_pool_deploy(owner, admin, ren_pool):
    """
    Test if the contract is correctly deployed.
    """
    assert ren_pool.owner() == owner
    assert ren_pool.admin() == admin
    assert ren_pool.target() == C.POOL_TARGET
    assert ren_pool.isLocked() == False
    assert ren_pool.totalPooled() == 0

def test_ren_pool_deposit(ren_pool, ren_token, user):
    """
    Test deposit.
    """
    AMOUNT = 100
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0
    ren_token.callFaucet({'from': user})
    assert ren_token.balanceOf(user) == C.FAUCET_AMOUNT
    ren_token.approve(ren_pool, AMOUNT, {'from': user})
    ren_pool.deposit(AMOUNT, {'from': user})
    assert ren_token.balanceOf(ren_pool) == AMOUNT
    assert ren_pool.balanceOf(user) == AMOUNT
    assert ren_pool.totalPooled() == AMOUNT

def test_ren_pool_withdraw(ren_pool, ren_token, user):
    """
    Test withdraw.
    """
    AMOUNT = 100
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0
    ren_token.callFaucet({'from': user})
    assert ren_token.balanceOf(user) == C.FAUCET_AMOUNT
    ren_token.approve(ren_pool, AMOUNT, {'from': user})
    ren_pool.deposit(AMOUNT, {'from': user})
    assert ren_token.balanceOf(ren_pool) == AMOUNT
    assert ren_pool.balanceOf(user) == AMOUNT
    assert ren_pool.totalPooled() == AMOUNT
    ren_pool.withdraw(AMOUNT, {'from': user})
    assert ren_pool.balanceOf(user) == 0
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0
    
def test_withdraw_fullfilment(owner, user, ren_pool, ren_token):
    WITHDRAW_AMOUNT = 1000

    assert ren_pool.totalPooled() == 0
    # Depositing 100k in the pool to lock it        
    ren_token.approve(ren_pool.address, C.POOL_TARGET, {'from': owner})
    ren_pool.deposit(C.POOL_TARGET, {'from': owner})
    assert ren_pool.isLocked
    
    ren_pool.withdrawRequest(WITHDRAW_AMOUNT, {'from': owner}) # The pool is locked so this will create a withdraw request

    assert ren_pool.totalPooled() == C.POOL_TARGET
    assert ren_pool.withdrawRequests(owner) # seeing if there is a withdraw request
    
    # Fullfilling
    ren_token.callFaucet({'from': user})
    
    # User fullfills the withdraw request of the owner
    ren_token.approve(ren_pool.address, WITHDRAW_AMOUNT , {'from': user})
    ren_pool.fullfillWithdrawRequest(owner, {'from': user}) # Filfilling the request made by owner
    
    assert ren_token.balanceOf(user, {'from': user}) == C.FAUCET_AMOUNT - 1000 # Account has fullfiled the withdraw request (so he has 1000 ren less)
    assert ren_pool.balanceOf(user, {'from': user}) == WITHDRAW_AMOUNT
    assert ren_pool.totalPooled() == C.POOL_TARGET # Pool still full