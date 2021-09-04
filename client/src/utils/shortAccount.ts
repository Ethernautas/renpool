export const shortAccount = (account?: string): string => (
  account == null
    ? ''
    : `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
)
