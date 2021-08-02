# @version >=0.2.7 <0.3.0

from vyper.interfaces import ERC20

# TODO: what happens in case of the pool being slashed?
# TODO: Earnings distribution
# TODO: Node fees
# TODO: Do we need to store the node/server id? And or we pass said value to the REN protocol on node submission
# TODO: need a method to send REN to the protocol once TARGET is reached. This should be accesible only by the owner(s)
# TODO add fallback function to receive ETH on case we need to pay for transaction fees or whatever
# TODO: add ownable functionality. see openzeplin: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/b0cf6fbb7a70f31527f36579ad644e1cf12fdf4e/contracts/access/Ownable.sol
# TODO: check that the REN mainnet token actually has 10 decimals precision for the TARGET to be well defined.
#
# Observation: how to mint REN tokens when testing -->
# MintableForkToken (brownie). source: https://www.youtube.com/watch?v=jh9AuCfw6Ck
# Watch video on how to mint dai and usdc https://www.youtube.com/watch?v=0JrDbvBClEA
#
# Architecture options:
# 1. Have a single pool with a target of 100.000 REN tokens. Once target is reached we should deploy another
# contract in case we want to have a second pool.
# 2. Have a single pool with no limit. Then, we setup a node for every 100.000 tokens we get.

TARGET: constant(uint256) = 100_000 * 10 ** 18 # amount of tokens required to spin up a REN node

owner: public(address)
renToken: public(ERC20)
balances: public(HashMap[address, uint256]) # QUESTION: shouldn't we speak about shares instead? (in case of slashing and rewards distribution)?
totalPooled: public(uint256) # total amount of REN stored in the pool
isLocked: public(bool) # True once all tokens have been transferred to the REN protocol, False otherwise
fee: public(uint256) # pool's fee (percentage)

event RenDeposited:
    addr: indexed(address)
    amount: uint256
    time: uint256

event RenWithdrawn:
    addr: indexed(address)
    amount: uint256
    time: uint256

event PoolTargetReached:
    time: uint256

event PoolLocked:
    time: uint256

event PoolUnlocked:
    time: uint256

@external
def __init__(_renTokenAddr: address):
    self.owner = msg.sender
    self.renToken = ERC20(_renTokenAddr)
    self.isLocked = False
    self.totalPooled = 0 # this might be decimal in case of slash
    self.fee = 10 # TODO

@internal
def _lockPool():
    self.isLocked = True
    log PoolLocked(block.timestamp)

@internal
def _unlockPool():
    self.isLocked = False
    log PoolUnlocked(block.timestamp)

@external
@nonreentrant('lock')
def deposit(_amount: uint256):
    addr: address = msg.sender
    now: uint256 = block.timestamp

    assert _amount > 0, "Amount must be positive"
    assert _amount + self.totalPooled <= TARGET, "Amount surpasses pool target"

    self.renToken.transferFrom(addr, self, _amount)
    # ^ user needs approve this transaction (give allowance) for the transferFrom method to pass.
    # See: https://ethereum.org/nl/developers/tutorials/erc20-annotated-code/
    self.balances[addr] += _amount # uint256 is set to zero by default
    self.totalPooled += _amount
    log RenDeposited(addr, _amount, now)

    if self.totalPooled == TARGET:
        self._lockPool()
        log PoolTargetReached(now)

@external
@nonreentrant('lock')
def withdraw(_amount: uint256):
    addr: address = msg.sender
    addrBalance: uint256 = self.balances[addr]
    now: uint256 = block.timestamp

    assert addrBalance > 0 and addrBalance >= _amount, "Insufficient funds"
    assert not self.isLocked, "Funds are locked"

    self.renToken.transfer(addr, _amount)
    self.balances[addr] -= _amount
    self.totalPooled -= _amount
    # ^ TODO: actually, we should add the request to the queue and only perform the withdraw
    # when there is another user whilling to take it's place or 50% of the users wants to withdraw
    # and therefore close the node
    # TODO: in case of slashing the user won't be able to witthdraw the full amount

    log RenWithdrawn(addr, _amount, now)

@view
@external
def balanceOf(_addr: address) -> uint256:
    return self.balances[_addr]

@external
def submit():
    """
    Once the TARGET is reached, submit the 100_000 tokens to the REN protocol to initiate the dark node.
    TODO: we need REN contract addr and method name. Do we need to pass node id or something?
    """
    assert msg.sender == self.owner, "Unauthorized"
    self._lockPool()

@external
def slash(_amount: uint256):
    assert msg.sender == self.owner, "Unauthorized"
    # TODO: recalculate shares
    self._unlockPool()
