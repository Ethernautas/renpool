import os
from brownie import ZERO_ADDRESS, accounts, config, RenToken, RenPool
import constants as C

def main():
  """
  1. Mint (ERC20) REN token;
  2. Deploy RenPool contract;
  """
  owner = accounts[0]
  admin = accounts[1]
  # account = accounts.add(config['wallets']['from_key'])

  renTokenAddr = ZERO_ADDRESS
  darknodeRegistryAddr = ZERO_ADDRESS

  if (config['networks']['default'] == 'development'):
    renToken = RenToken.deploy({'from': owner})
    renTokenAddr = renToken.address
  else:
    renTokenAddr = os.environ['REN_TOKEN_ADDRESS']
    darknodeRegistryAddr = os.environ['DARKNODE_REGISTRY_ADDRESS']

  renPool = RenPool.deploy(
    renTokenAddr,
    darknodeRegistryAddr,
    owner,
    C.POOL_TARGET,
    {'from': admin}
  )

  return renToken, renPool
