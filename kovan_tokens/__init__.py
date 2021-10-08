import brownie

from kovan_tokens.forked import BrownieTokensError, MintableKovanForkToken, skip_holders

brownie.config["autofetch_sources"] = True
