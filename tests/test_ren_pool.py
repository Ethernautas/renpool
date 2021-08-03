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
    ren_token.getFromFaucet({'from': user})
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
    ren_token.getFromFaucet({'from': user})
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
