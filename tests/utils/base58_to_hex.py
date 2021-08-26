import utils

def test_conversion():
  """
  Test base58 to hex conversion.
  """
  input = '8MHJ9prQt7UGupfZKSMVes3VzPrGBB'
  output = '0x597869E66F904F741Bf16788F1FCAe36E603F112'
  assert utils.base58_to_hex(input).upper() == output.upper()
