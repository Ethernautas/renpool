declare global {
  interface Window {
    ethereum: any
    web3: any
  }
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_CHAIN_ID: ('1' | '42' | '1337')
      REACT_APP_INFURA_PROJECT_ID: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
