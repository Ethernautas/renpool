import constants as C

def test_ren_mint(owner, ren_token):
    """
    Test REN tokens are properly minted.
    """
    assert ren_token.balanceOf(owner) == C.POOL_BOND

def test_ren_symbol(ren_token):
    """
    Test REN token has the correct symbol.
    """
    assert ren_token.symbol() == 'REN'


