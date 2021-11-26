
export type Param = {
    internalType: string,
    name: string,
    type: string,
}

export type ConstructorType = {
    type: 'constructor',
    inputs: Param[],
    stateMutability: string
}

export type EventType = {
    type: 'event',
    name: string,
    inputs: Param[],
    anonymous: boolean,
}

export type FunctionType = {
    type: 'function',
    name: string,
    inputs: Param[],
    outputs: Param[],
    stateMutability: string
}

export type Artifact = {
    contractName: string,
    abi: (ConstructorType | EventType | FunctionType)[],
    metadata: string,
    bytecode: string,
    deployedBytecode: string,
    linkReferences: any,
    deployedLinkReferences: any,
};

export const RenPool: Artifact;
export const IERC20Standard: Artifact;
export const IDarknodeRegistry: Artifact;

export type AddressType = string;

export const deployments: {
    [key in 'mainnet' | 'kovan']: {
        renTokenAddr: AddressType,
        renBTCAddr: AddressType,
        topRenTokenHolderAddr: AddressType,
        darknodeRegistryAddr: AddressType,
        darknodeRegistryStoreAddr: AddressType,
        darknodePaymentAddr: AddressType,
        claimRewardsAddr: AddressType,
        gatewayRegistryAddr: AddressType,
    };
};
