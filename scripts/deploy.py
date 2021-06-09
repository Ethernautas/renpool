from brownie import ERC20, accounts, RenPool

def main():
    """ Simple deploy script for our contract. """
    token = ERC20.deploy("REN", "REN", 18, 1e21, {'from': accounts[0]})
    RenPool.deploy(token, {'from': accounts[0]})
