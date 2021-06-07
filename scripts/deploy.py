from brownie import accounts, RenPool

def main():
    """ Simple deploy script for our contract. """
    accounts[0].deploy(RenPool)
