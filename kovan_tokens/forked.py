import os
import requests
import sys
from brownie import Contract, Wei, web3
from brownie.convert import to_address
from typing import Dict, List, Optional

_ethplorer_api_key: str = os.getenv("ETHPLORER_API_KEY") or "freekey"

_token_holders: Dict = {}
_skip_list: List[str] = []

_token_names = ["Aave"]


class BrownieTokensError(Exception):
    pass


def update_skipped_addresses(token: Optional[str] = None) -> None:
    if token:
        _token_holders[token] = [a for a in _token_holders[token] if a not in _skip_list]
    else:
        for token in _token_holders:
            update_skipped_addresses(token)


def get_top_holders(address: str) -> List:
    address = to_address(address)
    if address not in _token_holders:
        holders = requests.get(
            f"https://kovan-api.ethplorer.io/getTopTokenHolders/{address}",
            params={"apiKey": _ethplorer_api_key, "limit": "50"},
        ).json()
        if "error" in holders:
            api_key_message = ""
            if _ethplorer_api_key == "freekey":
                api_key_message = (
                    " Adding $ETHPLORER_API_KEY (from https://ethplorer.io) as environment variable"
                    " may solve the problem."
                )
            raise BrownieTokensError(
                f"Ethplorer returned error: {holders['error']}." + api_key_message
            )

        _token_holders[address] = [to_address(i["address"]) for i in holders["holders"]]
        if address in _token_holders[address]:
            # don't steal from the treasury - that could cause wierdness
            _token_holders[address].remove(address)
        update_skipped_addresses(address)

    return _token_holders[address]


def skip_holders(*addresses: str) -> None:
    """
    Addresses that will remain untouched via '_mint_for_testing'.
    Does not include minting with custom logic.
    """
    global _skip_list
    _skip_list = list(set(_skip_list + list(addresses)))
    update_skipped_addresses()


class MintableKovanForkToken(Contract):
    """
    ERC20 wrapper for forked kovan tests that allows standardized token minting.
    """

    def _mint_for_testing(self, target: str, amount: Wei, tx: Dict = None) -> None:
        # check for custom minting logic
        fn_name = f"mint_{self.address}"
        if hasattr(sys.modules[__name__], fn_name):
            getattr(sys.modules[__name__], fn_name)(self, target, amount)
            return

        # check for token name if no custom minting logic exists for address
        if hasattr(self, "name") and not self.name.abi["inputs"]:
            name = self.name()
            fn_name = next((f"mint_{i}" for i in _token_names if name.startswith(i)), "")
            if fn_name and hasattr(sys.modules[__name__], fn_name):
                mint_result = getattr(sys.modules[__name__], fn_name)(self, target, amount)
                if mint_result:
                    return

        # if no custom logic, fetch a list of the top
        # token holders and start stealing from them
        for address in get_top_holders(self.address):
            balance = self.balanceOf(address)
            if not balance:
                continue
            if amount > balance:
                self.transfer(target, balance, {"from": address})
                amount -= balance
            else:
                self.transfer(target, amount, {"from": address})
                return

        raise ValueError(f"Insufficient tokens available to mint {self.name()}")
