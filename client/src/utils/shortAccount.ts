export const shortAccount = (account?: string): string => {
  if (account == null) return ''
  return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
}
