import React from 'react'
import ReactDOM from 'react-dom'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import './index.css'
import { App } from './App'
import { reportWebVitals } from './reportWebVitals'
import { Web3ProviderNetwork } from './components/Web3ProviderNetwork'
import { Web3ReactManager } from './components/Web3ReactManager'

const getLibrary = (provider: any): Web3Provider => {
  // console.log({ provider })
  const library = new Web3Provider(provider)
  library.pollingInterval = 12_000
  return library
}

if (typeof window !== 'undefined' && !!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Web3ReactManager>
          <App />
        </Web3ReactManager>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
