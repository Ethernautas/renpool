DECIMALS = 18
POOL_TARGET = 100_000 * 10 ** DECIMALS
FAUCET_AMOUNT = 1000 * 10 ** DECIMALS
# ^ TODO: try to move these constants to a constants file so that we can import them

def test_ren_mint(owner, ren_token):
    """
    Test REN tokens are properly minted.
    """
    INITIAL_SUPPLY = 1000_000_000 * 10 ** DECIMALS
    assert ren_token.balanceOf(owner) == INITIAL_SUPPLY

def test_ren_symbol(ren_token):
    """
    Test REN token has the correct symbol.
    """
    assert ren_token.symbol() == 'REN'

def test_ren_pool_deploy(owner, ren_pool):
    """
    Test if the contract is correctly deployed.
    """
    assert ren_pool.owner() == owner
    assert ren_pool.admin() == owner
    assert ren_pool.target() == POOL_TARGET
    assert ren_pool.isLocked() == False
    assert ren_pool.totalPooled() == 0

def test_ren_pool_deposit(accounts, ren_pool, ren_token):
    """
    Test deposit.
    """
    AMOUNT = 100
    acc = accounts[1]
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0
    ren_token.getFromFaucet({'from': acc})
    assert ren_token.balanceOf(acc) == FAUCET_AMOUNT
    ren_token.approve(ren_pool, AMOUNT, {'from': acc})
    ren_pool.deposit(AMOUNT, {'from': acc})
    assert ren_token.balanceOf(ren_pool) == AMOUNT
    assert ren_pool.balanceOf(acc) == AMOUNT
    assert ren_pool.totalPooled() == AMOUNT

def test_ren_pool_withdraw(accounts, ren_pool, ren_token):
    """
    Test withdraw.
    """
    AMOUNT = 100
    acc = accounts[1]
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0
    ren_token.getFromFaucet({'from': acc})
    assert ren_token.balanceOf(acc) == FAUCET_AMOUNT
    ren_token.approve(ren_pool, AMOUNT, {'from': acc})
    ren_pool.deposit(AMOUNT, {'from': acc})
    assert ren_token.balanceOf(ren_pool) == AMOUNT
    assert ren_pool.balanceOf(acc) == AMOUNT
    assert ren_pool.totalPooled() == AMOUNT
    ren_pool.withdraw(AMOUNT, {'from': acc})
    assert ren_pool.balanceOf(acc) == 0
    assert ren_pool.totalPooled() == 0
    assert ren_token.balanceOf(ren_pool) == 0
