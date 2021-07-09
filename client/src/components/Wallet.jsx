// import React, { useState, useEffect } from 'react'
// import { useWeb3React } from '@web3-react/core'
// import Web3 from 'web3'
// // import { Web3Provider } from '@ethersproject/providers'
// // import { InjectedConnector } from '@web3-react/injected-connector'
// import { Networks, shorter, TOKENS_BY_NETWORK } from '../utils'
// // import { EthBalance } from './EthBalance'
// // import { TokenList } from './TokenList'
// import { injected } from '../connectors'
// import { useEagerConnect } from '../hooks/useEagerConnect'
// import { useInactiveListener } from '../hooks/useInactiveListener'

// const shorter = (str: string): string => str?.length > 8 ? str.slice(0, 6) + '...' + str.slice(-4) : str

// export const Wallet = (): JSX.Element => {
//   const {
//     chainId,
//     account,
//     library,
//     activate,
//     active,
//     connector,
//   } = useWeb3React<Web3>()

//   // [
//   //   [ 0x00001, JSONABI ]
//   // ]
//   // const ABIs = useMemo(() => {
//   //   return (TOKENS_BY_NETWORK[chainId] || []).map<[string, any]>(
//   //     ({ address, abi }) => [address, abi]
//   //   )
//   // }, [chainId])

//   const handleConnect = () => {
//     activate(injected)
//   }

//   // console.log({ABIs})
//   // handle logic to recognize the connector currently being activated
//   const [activatingConnector, setActivatingConnector] = useState()

//   useEffect(() => {
//     console.log('Wallet running')
//     if (activatingConnector && activatingConnector === connector) {
//       setActivatingConnector(undefined)
//     }
//   }, [activatingConnector, connector])

//   // mount only once or face issues :P
//   const triedEager = useEagerConnect()

//   useInactiveListener(!triedEager || !!activatingConnector)

//   return (
//     <div>
//       <div>ChainId: {chainId}</div>
//       <div>Account: {shorter(account)}</div>
//       {active ? (
//         <div>✅ </div>
//       ) : (
//         <button type="button" onClick={handleConnect}>
//           Connect
//         </button>
//       )}
//       {active && (
//         <SWRConfig value={{ fetcher: fetcher(library, new Map(ABIs)) }}>
//           <EthBalance />
//           <TokenList chainId={chainId} />
//         </SWRConfig>
//       )}
//     </div>
//   )
// }
