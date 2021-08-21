from brownie import Contract

def load_contract(addr):
  try:
    c = Contract(addr)
  except ValueError:
    c = Contract.from_explorer(addr)
  return c
