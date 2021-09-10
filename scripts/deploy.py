import copy
from brownie import ZERO_ADDRESS, accounts, config, RenToken, RenPool
import constants as C
import utils

def main():
  """
  Set your .env file accordingly before deploying the RenPool contract.
  In case of live networks, make sure your account is funded.
  """
  network = config['networks']['default']

  owner = None
  nodeOperator = None
  renTokenAddr = ZERO_ADDRESS
  darknodeRegistryAddr = ZERO_ADDRESS
  renToken = None

  if network == C.NETWORKS['DEVELOPMENT']:
    owner = accounts[0]
    nodeOperator = accounts[1]
    renToken = RenToken.deploy({'from': owner})
    renTokenAddr = renToken.address
  else:
    account = accounts.add(config['wallets']['from_key'])
    owner = copy.copy(account)
    nodeOperator = copy.copy(account)
    renTokenAddr = C.CONTRACT_ADDRESSES[network]['REN_TOKEN']
    darknodeRegistryAddr = C.CONTRACT_ADDRESSES[network]['DARKNODE_REGISTRY']
    renToken = utils.load_contract(renTokenAddr)

  renPool = RenPool.deploy(
    renTokenAddr,
    darknodeRegistryAddr,
    owner,
    C.POOL_BOND,
    {'from': nodeOperator}
  )

  return renToken, renPool
