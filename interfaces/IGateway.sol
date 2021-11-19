// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IMintGateway {
	function mint(
		bytes32 _pHash,
		uint256 _amount,
		bytes32 _nHash,
		bytes calldata _sig
	) external returns (uint256);

	function mintFee() external view returns (uint256);
}

interface IBurnGateway {
	function burn(bytes calldata _to, uint256 _amountScaled) external returns (uint256);
	function burnFee() external view returns (uint256);
}

// TODO: In ^0.6.0, should be `interface IGateway is IMintGateway,IBurnGateway {}`
interface IGateway {
	/**
	 * @notice mint verifies a mint approval signature from RenVM and creates
	 * tokens after taking a fee for the `_feeRecipient`.
	 *
	 * @param _pHash (payload hash) The hash of the payload associated with the
	 * mint, ie, asset symbol and recipient address.
	 * @param _amount The amount of the token being minted, in its smallest
	 * denomination (e.g. satoshis for BTC).
	 * @param _nHash (nonce hash) The hash of the nonce, amount and pHash.
	 * @param _sig The signature of the hash of the following values:
	 * (pHash, amount, msg.sender, nHash), signed by the mintAuthority. Where
	 * mintAuthority refers to the address of the key that can sign mint requests.
	 *
	 * @dev See: https://github.com/renproject/gateway-sol/blob/7bd51d8a897952a31134875d7b2b621e4542deaa/contracts/Gateway/MintGatewayV3.sol
	 */
	// is IMintGateway
	function mint(
		bytes32 _pHash,
		uint256 _amount,
		bytes32 _nHash,
		bytes calldata _sig
	) external returns (uint256);

	function mintFee() external view returns (uint256);

	// is IBurnGateway
	function burn(bytes calldata _to, uint256 _amountScaled) external returns (uint256);
	function burnFee() external view returns (uint256);
}
