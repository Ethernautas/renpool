DECIMALS = 18
POOL_TARGET = 100_000 * 10 ** DECIMALS
FAUCET_AMOUNT = 1000 * 10 ** DECIMALS
INITIAL_SUPPLY = 1000_000_000 * 10 ** DECIMALS
# ^ TODO: try to move these constants to a constants file so that we can import them

def test_ren_mint(owner, ren_token):
    """
    Test REN tokens are properly minted.
    """
    assert ren_token.balanceOf(owner) == INITIAL_SUPPLY

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
    assert ren_pool.target() == POOL_TARGET
    assert ren_pool.isLocked() == False
    assert ren_pool.totalPooled() == 0

def test_ren_pool_deposit(ren_pool, ren_token, user):
    """
    Test deposit.
    """
    AMOUNT = 100
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0
    ren_token.getFromFaucet({'from': user})
    assert ren_token.balanceOf(user) == FAUCET_AMOUNT
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
    ren_token.getFromFaucet({'from': user})
    assert ren_token.balanceOf(user) == FAUCET_AMOUNT
    ren_token.approve(ren_pool, AMOUNT, {'from': user})
    ren_pool.deposit(AMOUNT, {'from': user})
    assert ren_token.balanceOf(ren_pool) == AMOUNT
    assert ren_pool.balanceOf(user) == AMOUNT
    assert ren_pool.totalPooled() == AMOUNT
    ren_pool.withdraw(AMOUNT, {'from': user})
    assert ren_pool.balanceOf(user) == 0
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0
    
    
def test_withdraw_fullfulment(owner, user, ren_pool, ren_token):
    # Depositing 100k in the pool to lock it
    DEPOSIT = 100000*10**18
    assert ren_pool.totalPooled() == 0
    
    

    ren_token.approve(ren_pool.address, DEPOSIT, {'from': owner})
    ren_pool.deposit(DEPOSIT, {'from': owner})
    
    WITHDRAW_AMOUNT = 1000*10**18
    ren_pool.withdraw(WITHDRAW_AMOUNT, {'from': owner}) # The pool is locked so this will create a withdraw request

    assert ren_pool.totalPooled() == 100000*10**18
    assert ren_pool.withdrawRequests(0) # seeing if there is a withdraw request
    
    # Fullfilling
    ren_token.getFromFaucet({'from': user})
    assert ren_token.balanceOf(user, {'from': user}) == 1000*10**18 # Account 1 has 1k REN
    
    # Account 1 fullfills the withdraw request
    ren_token.approve(ren_pool.address, 1000*10**18 , {'from': user})
    ren_pool.fullfillWithdrawRequest(0, {'from': user}) # Filfilling the request
    
    assert ren_token.balanceOf(user, {'from': user}) == 0 # Account has fullfiled the withdraw request
    assert ren_pool.balanceOf(user, {'from': user}) == 1000*10**18
    assert ren_pool.totalPooled() == 100000*10**18 # Pool still full