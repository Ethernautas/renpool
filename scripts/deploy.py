from brownie import accounts, ERC20, RenPool
# ^ accounts is coming from ganash and ERC20 and RenPool from the contracts folder.

def distribute_tokens(renToken):
  amount = 100_000 * 10 ** 18 # amount of tokens required to spin up a REN node
  for i in range(10):
    renToken.transfer(accounts[i], amount, {'from': accounts[0]})

def main():
  """
  1. Mint ERC20 (REN) token. See decimals and totalSupply on https://etherscan.io/token/0x408e41876cccdc0f92210600ef50372656052a38#readContract;
  2. Distribute REN tokens among accounts;
  3. Deploy RenPool contract;
  """
  renToken = ERC20.deploy("REN", "REN", 18, 1e28, {'from': accounts[0]})
  distribute_tokens(renToken)
  renPool = RenPool.deploy(renToken, {'from': accounts[0]})
  return renToken, renPool




