# @version >=0.2.7 <0.3.0

from vyper.interfaces import ERC20

# TODO: what happens in case of the pool being slashed?
# TODO: Earnings distribution
# TODO: Node fees
# TODO: Do we need to store the node/server id? And or we pass said value to the REN protocol on node submission
# TODO: need a method to send REN to the protocol once TARGET is reached. This should be accesible only by the owner(s)
# TODO add fallback function to receive ETH on case we need to pay for transaction fees or whatever
# TODO: add status var (UNLOCKED/LOCKED), only allow direct withdraws when status == UNLOCKED
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
ren_token: public(address)
balances: public(HashMap[address, uint256]) # TODO: shouldn't we speak about shares instead? (in case of slashing and rewards distribution)?
total_pooled: public(uint256) # total amount of REN in the pool
is_locked: public(bool) # True once the target tokens has been transferred to the REN protocol. False otherwise
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
def __init__(_ren_token: address):
    self.owner = msg.sender
    self.ren_token = _ren_token
    self.is_locked = False
    self.fee = 10 # TODO
    self.total_pooled = 0 # this might be decimal in case of slash

@payable
@external
def deposit(_amount: uint256):
    # TODO: how to make sure REN token is being transferred and not any other ERC20 token
    # token: address = self.token
    # assert ERC20(token).transfer(_addr, amount)
    # see: https://github.com/curvefi/curve-dao-contracts/blob/master/contracts/FeeDistributor.vy
    # see burn method
    addr: address = msg.sender # TODO: do we need index here?
    now: uint256 = block.timestamp

    assert _amount > 0, "Amount must be positive"
    assert _amount + self.total_pooled <= TARGET, "Amount surpasses pool target"

    ERC20(self.ren_token).transferFrom(addr, self, _amount)

    self.balances[addr] += _amount # uint256 is set to zero by default
    self.total_pooled += _amount

    log RenDeposited(addr, _amount, now)
    if self.total_pooled == TARGET:
        log PoolTargetReached(now)

@external
# @nonreentrant('lock') ??
def withdraw(_amount: uint256):
    addr: address = msg.sender
    addrBalance: uint256 = self.balances[addr]
    now: uint256 = block.timestamp

    assert addrBalance > 0 and addrBalance <= _amount, "Insufficient funds"
    assert not self.is_locked, "Funds are locked"

    self.balances[addr] -= _amount
    ERC20(self.ren_token).transfer(addr, _amount)
    # send(addr, _amount)
    # ^ TODO: actually, we should add the request to the queue and only perform the withdraw
    # when there is another user whilling to take it's place or 50% of the users wants to withdraw
    # and therefore close the node
    # TODO: in case of slashing the user won't be able to witthdraw the full amount

    log RenWithdrawn(addr, _amount, now)

@view
@external
def balanceOf(_addr: address) -> uint256:
    return self.balances[_addr]

@internal
def _lockPool():
    self.is_locked = True
    log PoolLocked(block.timestamp)

@internal
def _unlockPool():
    self.is_locked = False
    log PoolUnlocked(block.timestamp)

@external
def submit():
    assert msg.sender == self.owner, "Unauthorized"
    # TODO: transfer funds to the REN protocol. We need REN addr and method name. Do we need to pass node id or something?
    self._lockPool()

@external
def slash(_amount: uint256):
    assert msg.sender == self.owner, "Unauthorized"
    # TODO: recalculate shares
    self._unlockPool()
