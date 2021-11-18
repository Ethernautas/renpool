// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16;
// pragma solidity 0.5.16;

interface IDarknodePayment {
	/**
	 * @notice Transfers the funds allocated to the darknode to the darknode owner.
	 *
	 * @param _darknode The address of the darknode
	 * @param _token Which token to transfer
	 */
	function withdraw(address _darknode, address _token) external;

	function withdrawMultiple(address _darknode, address[] calldata _tokens) external;
}
