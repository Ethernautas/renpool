import os
from brownie import Contract, accounts, config, RenToken, RenPool
from brownie_tokens import MintableForkToken
import constants as C

def main():
  """
  Deploy a RenPool contract to the mainnet-fork, lock the pool by ptoviding
  liquidity and finally register a darknode instance.
  See: https://youtu.be/0JrDbvBClEA (brownie tutorial)
  See: https://renproject.github.io/contracts-ts/#/mainnet
  """
  if (config['networks']['default'] != 'mainnet-fork'):
    raise ValueError('Switch to mainnet-fork network')

  owner = accounts[0]
  admin = accounts[1]
  user = accounts[2]
  renTokenAddr = os.environ['REN_TOKEN_ADDRESS']
  darknodeRegistryAddr = os.environ['DARKNODE_REGISTRY_ADDRESS']

  renPool = RenPool.deploy(
    renTokenAddr,
    darknodeRegistryAddr,
    owner,
    C.POOL_TARGET,
    {'from': admin}
  )

  renToken = MintableForkToken(renTokenAddr)
  darknodeRegistry = Contract(darknodeRegistryAddr)

  renToken._mint_for_testing(user, C.POOL_TARGET)
  renToken.approve(renPool, C.POOL_TARGET, {'from': user})
  renPool.deposit(C.POOL_TARGET, {'from': user})

  if (renPool.isLocked() != True):
    raise ValueError('Pool is not locked')

  renPool.approveBondTransfer({'from': admin})
  renPool.registerDarknode('123', 'ABC')
