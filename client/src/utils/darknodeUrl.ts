enum ErrorMessages {
  EMPTY_STRING = 'EMPTY_STRING',
  START_WITH = 'START_WITH',
  ACTION = 'ACTION',
  PUBLIC_KEY = 'PUBLIC_KEY',
  NAME = 'NAME',
}

interface DarknodeParams {
  darknodeID: string
  publicKey: string
}

export const validDarknodeUrl = (
  url: string,
  darknodeBaseUrl: string,
): { isValid: boolean, err: string | null } => {
  if (url.trim().length === 0) {
    return { isValid: false, err: ErrorMessages.EMPTY_STRING }
  }
  if (!url.startsWith(darknodeBaseUrl)) {
    return { isValid: false, err: ErrorMessages.START_WITH }
  }
  if (!url.includes('action=register')) {
    return { isValid: false, err: ErrorMessages.ACTION }
  }
  if (!url.includes('&public_key=0x')) {
    return { isValid: false, err: ErrorMessages.PUBLIC_KEY }
  }
  if (!url.includes('&name=')) {
    return { isValid: false, err: ErrorMessages.NAME }
  }
  return { isValid: true, err: null }
}

export const getDarknodeUrlParams = (
  url: string,
  darknodeBaseUrl: string,
): DarknodeParams => {
  const darknodeID = url.slice(darknodeBaseUrl.length).split('?')[0] // base58

  const p1 = 'public_key='
  const p2 = '&name='
  const index1 = url.indexOf(p1)
  const index2 = url.indexOf(p2)
  const publicKey = url.slice(index1 + p1.length, index2)

  return { darknodeID, publicKey }
}
