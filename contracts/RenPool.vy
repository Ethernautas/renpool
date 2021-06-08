# @version >=0.2.7 <0.3.0

# TODO: what happens in case of the pool being slashed?
# TODO: Earnings distribution
# TODO: Node fees
# TODO: Do we need to store the node/server id? And or we pass said value to the REN protocol on node submission
# TODO: need a method to send REN to the protocol once LIMIT is reached. This should be accesible only by the owner(s)
# TODO add fallback function to receive ETH on case we need to pay for transaction fees or whatever
#
# Observation: how to mint REN tokens when testing -->
# MintableForkToken (brownie). source: https://www.youtube.com/watch?v=jh9AuCfw6Ck
# Watch video on how to mint dai and usdc https://www.youtube.com/watch?v=0JrDbvBClEA
#
# Options:
# 1. Have a single pool with a limit of 100.000 REN tokens. Once limit is reached we should deploy another
# contract in case we want to have a second pool.
# 2. Have a single pool with no limit. Then, we setup a node for every 100.000 tokens we get.

# Constants
LIMIT: constant(uint256) = 100000 # amount of REN required to set a node

# Variables
owner: public(address)
balances: public(HashMap[address, uint256])
totalBalance: public(uint256)
fee: public(uint256) # pool's fee percentage

# Events
event RenDeposited:
    user: indexed(address)
    amount: uint256
    time: uint256

event RenWithdrawn:
    user: indexed(address)
    amount: uint256
    time: uint256

event PoolLimitReached:
    time: uint256

# Class
@external
def __init__():
    self.owner = msg.sender
    self.fee = 10 # TODO
    self.totalBalance = 0

@external
@payable
def deposit():
    user: address = msg.sender # TODO: do we need index here?
    amount: uint256 = msg.value # TODO: should we require msg.value to be uint?
    now: uint256 = block.timestamp

    assert amount > 0, "Amount must be positive"
    assert amount + self.totalBalance <= LIMIT, "Amount surpasses pool limit"

    # TODO: make sure REN token is being transferred and not any other ERC20 token
    self.balances[user] += amount # uint256 is set to zero by default
    self.totalBalance += amount

    log RenDeposited(user, amount, now)
    if self.totalBalance == LIMIT:
        log PoolLimitReached(now)

@external
def withdraw(_amount: uint256):
    user: address = msg.sender
    userBalance: uint256 = self.balances[user]
    now: uint256 = block.timestamp

    assert userBalance > 0 and userBalance <= _amount, "Insufficient balance"

    self.balances[user] -= _amount
    send(user, _amount)
    # ^ TODO: actually, we should add the request to the queue and only perform the withdraw
    # when there is another user whilling to take it's place or 50% of the users wants to withdraw
    # and therefore close the node

    log RenWithdrawn(user, _amount, now)

@external
@view
def balanceOf(_user: address) -> uint256:
    return self.balances[_user]
