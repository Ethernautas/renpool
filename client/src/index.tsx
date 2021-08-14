import React from 'react'
import ReactDOM from 'react-dom'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ThemeProvider } from 'styled-components'
import { BaseStyles } from 'rimble-ui'
import { theme } from './theme'
import { Web3ProviderNetwork } from './context/Web3ProviderNetwork'
import { DarknodeRegistryProvider } from './context/DarknodeRegistryProvider'
import { RenTokenProvider } from './context/RenTokenProvider'
import { RenPoolProvider } from './context/RenPoolProvider'
import { Web3ReactManager } from './components/Web3ReactManager'
import './index.css'
import { App } from './App'
import { reportWebVitals } from './reportWebVitals'

const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12_000
  return library
}

if (typeof window !== 'undefined' && !!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BaseStyles>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getLibrary}>
            <Web3ReactManager>
              <DarknodeRegistryProvider>
                <RenTokenProvider>
                  <RenPoolProvider>
                    <App />
                  </RenPoolProvider>
                </RenTokenProvider>
              </DarknodeRegistryProvider>
            </Web3ReactManager>
          </Web3ProviderNetwork>
        </Web3ReactProvider>
      </BaseStyles>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
