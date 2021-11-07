pragma solidity ^0.8.7;

interface IClaimRewards {
  /**
   * claimRewardsToChain allows darknode operators to withdraw darknode
   * earnings, as an on-chain alternative to the JSON-RPC claim method.
   *
   * It will the operators total sum of rewards, for all of their nodes.
   *
   * @param assetSymbol_ The token symbol.
   *         E.g. "BTC", "DOGE" or "FIL".
   * @param recipientAddress_ An address on the asset's native chain, for
   *         receiving the withdrawn rewards. This should be a string as
   *         provided by the user - no encoding or decoding required.
   *         E.g.: "miMi2VET41YV1j6SDNTeZoPBbmH8B4nEx6" for BTC.
   * @param recipientChain_ A string indicating which chain the rewards should
   *         be withdrawn to. It should be the name of the chain as expected by
   *         RenVM (e.g. "Ethereum" or "Solana"). Support for different chains
   *         will be rolled out after this contract is deployed, starting with
   *         "Ethereum", then other host chains (e.g. "Polygon" or "Solana")
   *         and then lock chains (e.g. "Bitcoin" for "BTC"), also represented
   *         by an empty string "".
   * @param recipientPayload_ An associated payload that can be provided along
   *         with the recipient chain and address. Should be empty if not
   *         required.
   * @param fractionInBps_ A value between 0 and 10000 (inclusive) that
   *         indicates the percent to withdraw from each of the operator's
   *         darknodes. The value should be in BPS, meaning 10000 represents
   *         100%, 5000 represents 50%, etc.
   * @return nonce
   */
  function claimRewardsToChain(
      string memory assetSymbol_,
      string memory recipientAddress_,
      string memory recipientChain_,
      bytes memory recipientPayload_,
      uint256 fractionInBps_
  ) external returns (uint256);

  /**
   * `claimRewardsToEthereum` calls `claimRewardsToChain` internally.
   */
  function claimRewardsToEthereum(
      string memory assetSymbol_,
      address recipientAddress_,
      uint256 fractionInBps_
  ) external returns (uint256);
}
