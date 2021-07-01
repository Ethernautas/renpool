from brownie import accounts, RenToken, RenPool
# ^ accounts is coming from Ganache while RenToken and RenPool from the contracts folder.

def distribute_tokens(renToken):
  amount = 100_000 * 10 ** 18 # amount of tokens required to spin up a REN node
  for i in range(10):
    renToken.transfer(accounts[i], amount, {'from': accounts[0]})

def main():
  """
  1. Mint (ERC20) REN token;
  2. Distribute REN tokens among accounts;
  3. Deploy RenPool contract;
  """
  renToken = RenToken.deploy({'from': accounts[0]})
  # distribute_tokens(renToken)
  renPool = RenPool.deploy(renToken, {'from': accounts[0]})
  return renToken, renPool




