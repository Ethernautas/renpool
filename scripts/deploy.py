import os
import copy
from brownie import ZERO_ADDRESS, accounts, config, RenToken, RenPool
from brownie_tokens import MintableForkToken
import constants as C

def main():
  """
  Set your .env file accordingly before deploying the RenPool contract.
  In case of the live nets, make sure your account is funded.
  """
  owner = None
  admin = None
  renTokenAddr = ZERO_ADDRESS
  renToken = None

  if (config['networks']['default'] != 'development'):
    account = accounts.add(config['wallets']['from_key'])
    owner = copy.copy(account)
    admin = copy.copy(account)
    renTokenAddr = os.environ['REN_TOKEN_ADDRESS']
    renToken = MintableForkToken(renTokenAddr)
  else:
    owner = accounts[0]
    admin = accounts[1]
    renToken = RenToken.deploy({'from': owner})
    renTokenAddr = renToken.address

  renPool = RenPool.deploy(
    renTokenAddr,
    ZERO_ADDRESS,
    owner,
    C.POOL_BOND,
    {'from': admin}
  )

  return renToken, renPool
