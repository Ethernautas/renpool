const { expect } = require('chai');
const { generateTransactionHash, PackPrimitive, toURLBase64, fromBase64, Ox } = require('@renproject/utils');

describe("generateTransactionHash", () => {

    /**
     * These values were obtained using the following JSON-RPC query and
     * choosing one random transaction using the `BTC/toEthereum` selector.
     * 
     * ```
     * POST https://lightnode-testnet.herokuapp.com HTTP/1.1
     * Content-Type: application/json
     * Accept: application/json
     *
     * {
     *   "method": "ren_queryTxs",
     *   "id": 1,
     *   "jsonrpc": "2.0",
     *   "params": {
     *       "txStatus": "done",
     *       "offset": "0",
     *       "limit": "50"
     *   }
     * }
     * 
     * In particular, the following query will fetch the aforementioned transaction. 
     * 
     * ```
     * POST https://lightnode-testnet.herokuapp.com/ HTTP/1.1
     * Content-Type: application/json
     * Accept: application/json
     * 
     * {
     *   "method": "ren_queryTx",
     *   "id": 1,
     *   "jsonrpc": "2.0",
     *   "params": {
     *       "txHash": "8tmjw-pkNRPazHVzDArkJr62E_u1t6XVY6Zz-K2wzzk"
     *   }
     * }
     * ```
     * 
     */
    it("should return hash transaction for BTC/toEthereum selector", () => {
        const packValue = {
            t: {
                struct: [
                    { txid: PackPrimitive.Bytes },
                    { txindex: PackPrimitive.U32 },
                    { amount: PackPrimitive.U256 },
                    { payload: PackPrimitive.Bytes },
                    { phash: PackPrimitive.Bytes32 },
                    { to: PackPrimitive.Str },
                    { nonce: PackPrimitive.Bytes32 },
                    { nhash: PackPrimitive.Bytes32 },
                    { gpubkey: PackPrimitive.Bytes },
                    { ghash: PackPrimitive.Bytes32 }
                ],
            },
            v: {
                amount: "9505",
                ghash: "NxSL0LZIIKYN1zISF2wTO8RkcbHbpTA-wONRE4xvrGM",
                gpubkey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                nhash: "cjrzFtnKbOg7qmDGLdVnY4pYC4ezhEtjS_JcUAX5J10",
                nonce: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                payload: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAD7h7zyA7eNm2dxm37qO2tlogiWGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQlRDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                phash: "cwSzD7zafAjFwyPP0seLzSpaxLEBVSEfZ86HeZn4Mjc",
                to: "0x52aF1b09DC11B47DcC935877a7473E35D946b7C9",
                txid: "I0e8s6ekUfj0IssTvZ15NkkgZx5JyHaH2J7KLpAv4ZY",
                txindex: "0"
            },
        };

        expect(
            toURLBase64(generateTransactionHash("1", "BTC/toEthereum", packValue)),
        ).to.equal('8tmjw-pkNRPazHVzDArkJr62E_u1t6XVY6Zz-K2wzzk');

        expect(
            Ox(fromBase64(packValue.v.txid).reverse())
        ).to.be.equal('0x96e12f902eca9ed88776c8491e67204936799dbd13cb22f4f851a4a7b3bc4723'); 
    });
});
