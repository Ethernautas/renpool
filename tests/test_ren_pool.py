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
    assert ren_pool.bond() == C.POOL_BOND
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
    """
    Test withdraw fulfillment.
    """
    WITHDRAW_AMOUNT = 1000

    assert ren_pool.totalPooled() == 0

    # Depositing bond into the pool to lock it
    ren_token.approve(ren_pool.address, C.POOL_BOND, {'from': owner})
    ren_pool.deposit(C.POOL_BOND, {'from': owner})

    assert ren_pool.isLocked() == True
    assert ren_pool.totalPooled() == C.POOL_BOND

    # The pool is locked so now we can call request withdraw
    ren_pool.requestWithdraw(WITHDRAW_AMOUNT, {'from': owner})
    assert ren_pool.withdrawRequests(owner) == WITHDRAW_AMOUNT

    # User fulfills the withdraw request made by the owner
    ren_token.callFaucet({'from': user})
    ren_token.approve(ren_pool.address, WITHDRAW_AMOUNT , {'from': user})
    ren_pool.fulfillWithdrawRequest(owner, {'from': user})

    # Account has fullfiled the withdraw request so now the user has WITHDRAW_AMOUNT ren less in his balance
    assert ren_token.balanceOf(user, {'from': user}) == C.FAUCET_AMOUNT - WITHDRAW_AMOUNT
    assert ren_pool.balanceOf(user, {'from': user}) == WITHDRAW_AMOUNT
    assert ren_pool.totalPooled() == C.POOL_BOND # Pool still full
