import { darknodeIDBase58ToHex } from './'

test('converts base58 to hex', () => {
  const input = '8MHJ9prQt7UGupfZKSMVes3VzPrGBB'
  const output = '0x597869E66F904F741Bf16788F1FCAe36E603F112'

  expect(darknodeIDBase58ToHex(input)).toBe(output)
})
