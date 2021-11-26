const { expect } = require('chai');
const { generateTransactionHash, PackPrimitive, toURLBase64 } = require('@renproject/utils');

describe("generateTransactionHash", () => {
    it("should return hash transaction for BTC/toEthereum selector", () => {
        expect(
            toURLBase64(generateTransactionHash("1", "BTC/toEthereum",
                {
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
                }
            )),
        ).to.equal('8tmjw-pkNRPazHVzDArkJr62E_u1t6XVY6Zz-K2wzzk');
    });
});
