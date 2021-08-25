from brownie import Contract
import base58

def load_contract(addr):
  try:
    c = Contract(addr)
  except ValueError:
    c = Contract.from_explorer(addr)
  return c


def base58_to_hex(str):
  hex = "0x" + base58.b58decode(str).hex()[4:]
  return hex
