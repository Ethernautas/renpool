from brownie import accounts, ERC20, RenPool
# ^ accounts is coming from ganash and ERC20 and RenPool from the contracts folder.

def distribute_tokens(ren):
    for i in range(10):
        ren.transfer(accounts[i], 1000000, {'from': accounts[0]})

def main():
    """
    1. Mint ERC20 (REN) token;
    2. Distribute REN tokens among accounts;
    3. Deploy RenPool contract;
    """
    renToken = ERC20.deploy("REN", "REN", 18, 1e21, {'from': accounts[0]})
    distribute_tokens(renToken)
    renPool = RenPool.deploy(renToken, {'from': accounts[0]})
    return renToken, renPool




