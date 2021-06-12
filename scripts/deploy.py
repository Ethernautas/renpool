from brownie import ERC20, accounts, RenPool

def distribute_tokens(ren):
    for i in range(10):
        ren.transfer(accounts[i], 1000000, {'from': accounts[0]})

def main():
    """
    1. Mint ERC20 (REN) token,
    2. Distribute REN tokens among accounts and
    3. Deploy RenPool contract
    """
    ren = ERC20.deploy("REN", "REN", 18, 1e21, {'from': accounts[0]})
    distribute_tokens(ren)
    # pool = RenPool.deploy(ren.address, {'from': accounts[0]})
    pool = RenPool.deploy(ren, {'from': accounts[0]})
    return ren, pool
    # return token


