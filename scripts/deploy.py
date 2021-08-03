from brownie import accounts, RenToken, RenPool
# ^ accounts is coming from Ganache while RenToken and RenPool from the contracts folder.
import constants as C

# TODO: use real renToken address in production and testnets ('0x408e41876cccdc0f92210600ef50372656052a38')

def distribute_tokens(renToken, owner):
  for i in range(10):
    renToken.transfer(accounts[i], C.DECIMALS, {'from': owner})

def main():
  """
  1. Mint (ERC20) REN token;
  2. Distribute REN tokens among accounts;
  3. Deploy RenPool contract;
  """
  owner = accounts[0]
  admin = accounts[1]
  renToken = RenToken.deploy({'from': owner})
  # distribute_tokens(renToken, owner)
  renPool = RenPool.deploy(renToken, owner, C.POOL_TARGET, {'from': admin})
  return renToken, renPool
