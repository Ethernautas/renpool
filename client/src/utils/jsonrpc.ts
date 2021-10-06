import { RenNetworkDetails } from '@renproject/contracts'
// import { Record } from '@renproject/react-components'
import Axios from 'axios'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { sha256 } from 'ethereumjs-util'
// import { getLightnode } from '../../store/mapContainer'
// import { sanitizeBase64String } from '../general/encodingUtils'
import { DEFAULT_REQUEST_TIMEOUT } from '../constants'
// import { retryNTimes } from '../retryNTimes'
// import { hashTransaction } from '../web3/signatures'
import {
  // QueryBlockStateResponse,
  toNativeTokenSymbol,
} from './utils/blockStateUtils'

// interface ResponseQueryStat {
//     version: string;
//     multiAddress: string;
//     cpus: Array<{
//         cores: number;
//         clockRate: number;
//         cacheSize: number;
//         modelName: string;
//     }>;
//     memory: number;
//     memoryUsed: number;
//     memoryFree: number;
//     disk: number;
//     diskUsed: number;
//     diskFree: number;
//     systemUptime: number;
//     serviceUptime: number;
// }

// export class NodeStatistics extends Record({
//   version: '',
//   multiAddress: '',
//   memory: 0,
//   memoryUsed: 0,
//   memoryFree: 0,
//   disk: 0,
//   diskUsed: 0,
//   diskFree: 0,
//   systemUptime: 0,
//   serviceUptime: 0,

//   cores: 0,
// }) {}

export interface RPCResponse<T> {
    jsonrpc: '2.0';
    id: number;
    result: T;
}

export const getLightnode = (
  network: RenNetworkDetails,
  isNew = false,
): string => {
  if (isNew) {
    switch (network.name) {
      case 'mainnet':
        return 'https://lightnode-mainnet.herokuapp.com'
      case 'testnet':
        return 'https://lightnode-testnet.herokuapp.com'
        // TODO: fees - not sure about following ones;
        // case "chaosnet":
        //     return "https://lightnode-chaosnet-new.herokuapp.com";
      case 'devnet':
        return 'https://lightnode-devnet.herokuapp.com'
      case 'localnet':
        return 'http://0.0.0.0:8888'
    }
  }
  switch (network.name) {
    case 'mainnet':
      return 'https://lightnode-mainnet.herokuapp.com'
    case 'chaosnet':
      return 'https://lightnode-chaosnet-new.herokuapp.com'
    case 'testnet':
      return 'https://lightnode-testnet.herokuapp.com'
    case 'devnet':
      return 'https://lightnode-devnet.herokuapp.com'
    case 'localnet':
      return 'http://0.0.0.0:8888'
  }
  return ''
}

export const sanitizeBase64String = (value: string) =>
  value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const marshalUint = (value: number, length: number) => {
  try {
    return new BN(
      typeof value === 'number' ? value : (value as string).toString(),
    ).toArrayLike(Buffer, 'be', length)
  } catch (error) {
    (error as any).message = `Unable to marshal uint${
      length * 8
    } '${value}': ${String((error as any).message)}`
    throw error
  }
}

const marshalU = (length: number) => (value: number) =>
  marshalUint(value, length)
const marshalU8 = marshalU(8 / 8)
const marshalU16 = marshalU(16 / 8)
const marshalU32 = marshalU(32 / 8)
const marshalU64 = marshalU(64 / 8)
const marshalU128 = marshalU(128 / 8)
const marshalU256 = marshalU(256 / 8)

const withLength = (value: Buffer) =>
  Buffer.concat([marshalU32(value.length), value])

export const marshalString = (value: string) => {
  return withLength(Buffer.from(value))
}

const marshalPackTypeDefinition = (type: PackTypeDefinition): Buffer => {
  if (typeof type === 'object') {
    return Buffer.concat([
      Buffer.from([marshalPackType('struct')]),
      marshalPackStructType(type),
    ])
  } else if (typeof type === 'string') {
    return Buffer.from([marshalPackType(type)])
  }
  throw new Error(`Unable to marshal type ${String(type)}.`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const marshalPackStruct = (type: PackStructType, value: any): Buffer => {
  return Buffer.concat(
    type.struct.map((member: any) => {
      const keys = Object.keys(member)
      if (keys.length === 0) {
        throw new Error('Invalid struct member with no entries.')
      }
      if (keys.length > 1) {
        throw new Error('Invalid struct member with multiple entries.')
      }
      const key = Object.keys(member)[0]
      const memberType = member[key]
      try {
        return marshalPackValue(memberType, value[key])
      } catch (error) {
        (
                    error as Error
        ).message = `Unable to marshal struct field ${key}: ${String(
          (error as Error).message,
        )}`
        throw error
      }
    }),
  )
}

const marshalPackPrimitive = (
  type: PackPrimitive,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): Buffer => {
  switch (type) {
    // Booleans
    case PackPrimitive.Bool:
      return marshalU8(value ? 1 : 0)
      // Integers
    case PackPrimitive.U8:
      return marshalU8(value)
    case PackPrimitive.U16:
      return marshalU16(value)
    case PackPrimitive.U32:
      return marshalU32(value)
    case PackPrimitive.U64:
      return marshalU64(value)
    case PackPrimitive.U128:
      return marshalU128(value)
    case PackPrimitive.U256:
      return marshalU256(value)
      // Strings
    case PackPrimitive.Str: {
      return marshalString(value)
    }
    // Bytes
    case PackPrimitive.Bytes: {
      return withLength(
        Buffer.isBuffer(value)
          ? Buffer.from(value)
          : // Supports base64 url format
          fromBase64(value),
      )
    }
    case PackPrimitive.Bytes32:
    case PackPrimitive.Bytes65:
      return Buffer.isBuffer(value)
        ? Buffer.from(value)
        : // Supports base64 url format
        fromBase64(value)
  }
}

const marshalPackValue = (
  type: PackTypeDefinition,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): Buffer => {
  if (typeof type === 'object') {
    return marshalPackStruct(type, value)
  } else if (typeof type === 'string') {
    if (type === 'nil') return Buffer.from([])
    return marshalPackPrimitive(type, value)
  }
  throw new Error(
    `Unknown value type ${String(type)}${
      !type ? ` for value ${String(value)}` : ''
    }`,
  )
}

export const marshalTypedPackValue = ({ t, v }: TypedPackValue) => {
  const marshalledType = marshalPackTypeDefinition(t)
  const marshalledValue = marshalPackValue(t, v)
  return Buffer.concat([marshalledType, marshalledValue])
}

export const hashTransaction = (
  version: string,
  selector: string,
  packValue: TypedPackValue,
) => {
  return sha256(
    Buffer.concat([
      marshalString(version),
      marshalString(selector),
      marshalTypedPackValue(packValue),
    ]),
  )
}

// export const queryStat = async (lightnode: string, darknodeID: string) => {
//   const request = {
//     jsonrpc: '2.0',
//     method: 'ren_queryStat',
//     params: {},
//     id: 67,
//   }
//   const result = (
//     await retryNTimes(
//       async () =>
//         await Axios.post<RPCResponse<ResponseQueryStat>>(
//           `${lightnode}?id=${darknodeID}`,
//           request,
//           { timeout: DEFAULT_REQUEST_TIMEOUT },
//         ),
//       2,
//     )
//   ).data.result
//   return new NodeStatistics({
//     version: result.version,
//     multiAddress: result.multiAddress,
//     memory: result.memory,
//     memoryUsed: result.memoryUsed,
//     memoryFree: result.memoryFree,
//     disk: result.disk,
//     diskUsed: result.diskUsed,
//     diskFree: result.diskFree,
//     systemUptime: result.systemUptime,
//     serviceUptime: result.serviceUptime,
//     cores: result.cpus.reduce((sum, cpu) => sum + cpu.cores, 0),
//   })
// }

// export interface RenVMState {
//     state: {
//         [chain: string]: {
//             address: string; // "19iqYbeATe4RxghQZJnYVFU4mjUUu76EA6";
//             dust: string; // "546";
//             gasCap: string; // "68";
//             gasLimit: string; // "400";
//             gasPrice: string; // "68";
//             latestChainHash: string; // "";
//             latestChainHeight: string; // "687159";
//             minimumAmount: string; // "547";
//             output?: {
//                 outpoint: {
//                     hash: string; // "X8rTxRtVMBPJeOp3n5O7lvtzwL5CpP2wOBXfvw2JrpQ";
//                     index: string; // "1";
//                 };
//                 pubKeyScript: string; // "dqkUX6qVduRay8lmK2q_MjIpt0ipSV2IrA";
//                 value: string; // "1103287860496";
//             };
//             pubKey: string; // "A6Auk8-MR7JQB1sK9h-W69EDdsCqp2NRSOiJyytRyWkn";
//         };
//     };
// }

// export const queryState = async (lightnode: string): Promise<RenVMState> => {
//   const request = {
//     jsonrpc: '2.0',
//     method: 'ren_queryState',
//     params: {},
//     id: 67,
//   }
//   const result = (
//     await retryNTimes(
//       async () =>
//         await Axios.post<RPCResponse<RenVMState>>(lightnode, request, {
//           timeout: DEFAULT_REQUEST_TIMEOUT,
//         }),
//       2,
//     )
//   ).data.result
//   return result
// }

// export const queryBlockState = async (network: RenNetworkDetails) => {
//   const lightnode = getLightnode(network, true)
//   if (!lightnode) {
//     throw new Error('No lightnode to fetch fees.')
//   }
//   const request = {
//     jsonrpc: '2.0',
//     method: 'ren_queryBlockState',
//     id: 300,
//     params: {},
//   }

//   // if (lightnode !== "toggleMock") {
//   //     return Promise.resolve(queryBlockStateResponse);
//   // }

//   const response = await Axios.post<RPCResponse<QueryBlockStateResponse>>(
//     lightnode,
//     request,
//     {
//       timeout: DEFAULT_REQUEST_TIMEOUT,
//     },
//   )
//   // eslint-disable-next-line  @typescript-eslint/no-explicit-any
//   return response.data as any
// }

// export const getTransactionHash = (
//   renNetwork: RenNetworkDetails,
//   token: string,
//   node: string,
//   amount: BigNumber,
//   to: string,
//   nonce: number,
//   signature: string,
// ) => {
//   const request = {
//     method: 'ren_submitTx',
//     id: 1,
//     jsonrpc: '2.0',
//     params: {
//       tx: {
//         hash: 'xeP7Ehi4g7S3erp8z-7yU1td07757diRYtwd0s-4SzI', // TODO: where to find it?
//         in: {
//           t: {
//             struct: [
//               {
//                 type: 'string',
//               },
//               {
//                 network: 'string',
//               },
//               {
//                 node: 'bytes32',
//               },
//               {
//                 amount: 'u256',
//               },
//               {
//                 to: 'string',
//               },
//               {
//                 nonce: 'u64',
//               },
//               {
//                 signature: 'bytes',
//               },
//             ],
//           },
//           v: {
//             type: 'ethSign',
//             network: renNetwork.name,
//             node,
//             amount: amount.toFixed(),
//             to,
//             nonce: String(nonce),
//             signature,
//           },
//         },
//         selector: `${toNativeTokenSymbol(token)}/claimFees`,
//         version: '1',
//       },
//     },
//   }
//   return sanitizeBase64String(
//     hashTransaction(
//       request.params.tx.version,
//       request.params.tx.selector,
//             request.params.tx.in as any,
//     ).toString('base64'),
//   )
// }

export const claimFees = async (
  renNetwork: RenNetworkDetails,
  token: string,
  node: string,
  amount: BigNumber,
  to: string,
  nonce: number,
  signature: string,
) => {
  const lightnode = getLightnode(renNetwork, true)
  if (!lightnode) {
    throw new Error('No lightnode to claim fees.')
  }
  const request = {
    method: 'ren_submitTx',
    id: 1,
    jsonrpc: '2.0',
    params: {
      tx: {
        hash: '',
        in: {
          t: {
            struct: [
              {
                type: 'string',
              },
              {
                network: 'string',
              },
              {
                node: 'bytes32',
              },
              {
                amount: 'u256',
              },
              {
                to: 'string',
              },
              {
                nonce: 'u64',
              },
              {
                signature: 'bytes',
              },
            ],
          },
          v: {
            type: 'ethSign',
            network: renNetwork.name,
            node,
            amount: amount.toFixed(),
            to,
            nonce: String(nonce),
            signature,
          },
        },
        selector: `${toNativeTokenSymbol(token)}/claimFees`,
        version: '1',
      },
    },
  }
  const txHash = sanitizeBase64String(
    hashTransaction(
      request.params.tx.version,
      request.params.tx.selector,
            request.params.tx.in as any,
    ).toString('base64'),
  )
  request.params.tx.hash = txHash

  const response = await Axios.post<RPCResponse<any>>(lightnode, request, {
    timeout: DEFAULT_REQUEST_TIMEOUT,
  }).catch((err: Error) => {
    throw err
  })
  console.info(request, response)
  return response
}

// export enum ClaimFeesStatus {
//     Pending = 'pending',
//     Executing = 'executing',
//     Done = 'done',
// }

// export const getClaimFeesStatus = async (
//   renNetwork: RenNetworkDetails,
//   renVMHash: string,
// ): Promise<{
//     status: ClaimFeesStatus;
//     revert?: string;
// }> => {
//   const lightnode = getLightnode(renNetwork, true)
//   if (!lightnode) {
//     throw new Error('No lightnode to claim fees.')
//   }

//   const request = {
//     id: 1,
//     jsonrpc: '2.0',
//     method: 'ren_queryTx',
//     params: { txHash: renVMHash },
//   }

//   const response = await Axios.post<
//         RPCResponse<{
//             tx:
//                 | { out: undefined }
//                 | {
//                       out: {
//                           v: {
//                               revert: string;
//                           };
//                       };
//                   };
//             txStatus: ClaimFeesStatus;
//         }>
//     >(lightnode, request, {
//       timeout: DEFAULT_REQUEST_TIMEOUT,
//     }).catch((err) => {
//       throw err
//     })

//   const result = response.data.result

//   return {
//     status: result.txStatus,
//     revert:
//             result.tx.out && result.tx.out.v.revert !== ''
//               ? result.tx.out.v.revert
//               : undefined,
//   }
// }
