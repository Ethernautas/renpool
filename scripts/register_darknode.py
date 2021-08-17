from brownie import accounts, config, RenPool
from brownie_tokens import MintableForkToken
import constants as C

def main():
  """
  Deploy a RenPool contract to the mainnet-fork, lock the
  pool by providing liquidity and finally register a
  darknode instance.
  See: https://youtu.be/0JrDbvBClEA (brownie tutorial)
  See: https://renproject.github.io/contracts-ts/#/mainnet
  """
  network = config['networks']['default']

  if (network != 'mainnet-fork'):
    raise ValueError('Unsupported network, switch to mainnet-fork')

  owner = accounts[0]
  admin = accounts[1]
  user = accounts[2]

  renTokenAddr = C.CONTRACT_ADDRESSES[network].REN_TOKEN
  darknodeRegistryAddr = C.CONTRACT_ADDRESSES[network].DARKNODE_REGISTRY

  renPool = RenPool.deploy(
    renTokenAddr,
    darknodeRegistryAddr,
    owner,
    C.POOL_BOND,
    {'from': admin}
  )

  renToken = MintableForkToken(renTokenAddr)
  renToken._mint_for_testing(user, C.POOL_BOND)

  renToken.approve(renPool, C.POOL_BOND, {'from': user})
  renPool.deposit(C.POOL_BOND, {'from': user})

  if (renPool.isLocked() != True):
    raise ValueError('Pool is not locked')

  renPool.approveBondTransfer({'from': admin})
  renPool.registerDarknode(user, 'some_public_key', {'from': admin})

  return renToken, renPool
