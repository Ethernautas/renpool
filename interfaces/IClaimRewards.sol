// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IClaimRewards {
	/**
	 * `claimRewardsToEthereum` triggers a withdrawal of a darknode operator's
	 * rewards. `claimRewardsToEthereum` must be called by the operator
	 * performing the withdrawals. When RenVM sees the claim, it will produce a
	 * signature which needs to be submitted to the asset's Ren Gateway contract
	 * on Ethereum.
	 *
	 * @param assetSymbol_ The asset being claimed. e.g. "BTC" or "DOGE"
	 * @param recipientAddress_ The Ethereum address to which the assets are
	 * being withdrawn to. This same address must then call `mint` on
	 * the asset's Ren Gateway contract.
	 * @param fractionInBps_ A value between 0 and 10000 that indicates the
	 * percent to withdraw from each of the operator's darknodes.
	 * 10000 represents 100%, 5000 represents 50%, etc.
	 */
	function claimRewardsToEthereum(
		string memory assetSymbol_,
		address recipientAddress_,
		uint256 fractionInBps_
	) external returns (uint256);
}
