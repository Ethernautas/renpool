import copy
from brownie import ZERO_ADDRESS, accounts, config, Contract, RenToken, RenPool
import constants as C

def main():
  """
  Set your .env file accordingly before deploying the RenPool contract.
  In case of live networks, make sure your account is funded.
  """
  network = config['networks']['default']

  if (network != 'development' and network != 'kovan' and network != 'mainnet'):
    raise ValueError('Unsupported network, switch to development, kovan or mainnet')

  owner = None
  admin = None
  renTokenAddr = ZERO_ADDRESS
  darknodeRegistryAddr = ZERO_ADDRESS
  renToken = None

  if (network == 'development'):
    owner = accounts[0]
    admin = accounts[1]
    renToken = RenToken.deploy({'from': owner})
    renTokenAddr = renToken.address
  else:
    account = accounts.add(config['wallets']['from_key'])
    owner = copy.copy(account)
    admin = copy.copy(account)
    renTokenAddr = C.CONTRACT_ADDRESSES[network].REN_TOKEN
    darknodeRegistryAddr = C.CONTRACT_ADDRESSES[network].DARKNODE_REGISTRY
    renToken = Contract(renTokenAddr)

  renPool = RenPool.deploy(
    renTokenAddr,
    darknodeRegistryAddr,
    owner,
    C.POOL_BOND,
    {'from': admin}
  )

  return renToken, renPool
