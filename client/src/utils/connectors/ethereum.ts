import '../../types/index.d.ts'

export const getEthereum = async (): Promise<any> => {
  // event listener is not reliable
  while (document.readyState !== 'complete') {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return window.ethereum
}
