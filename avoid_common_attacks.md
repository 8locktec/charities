Common attacks explanation and mitigation
=========================================

Arithmetical buffer over and underflows
---------------------------------------

### `Explanation`

### In Solidity uint variables are used heavily, crypto accounts have their balances defined as uint256 type, meaning that any crypto hackers could flip their empty wallet to MAX value without any effort, and any rich man could overflow their wallet with a simple transaction.

### `Mitigation`

To fix this, assert(), SafeMath library, or require() functions should be
adopted to pre-check the operators and maybe rollback an illegal transaction.
For the Charities contract all operations using the SafeMath library.

Reentrancy attacks
------------------

### `Explanation`

### One of the major dangers of [calling external contracts](https://consensys.github.io/smart-contract-best-practices/recommendations#external-calls) is that they can take over the control flow, and make changes to your data that the calling function wasn't expecting. This class of bug can take many forms, and both of the major bugs that led to the DAO's collapse were bugs of this sort. The first version of this bug to be noticed involved functions that could be called repeatedly, before the first invocation of the function was finished. This may cause the different invocations of the function to interact in destructive ways.

### `Mitigation`

The best mitigation method is to [use send() instead
of call.value()()](https://consensys.github.io/smart-contract-best-practices/recommendations#send-vs-call-value).
This will limit any external code from being executed and is used in the
Charities contract.

DoS with (Unexpected) revert
----------------------------

### `Explanation`

### If attacker bids using a smart contract which has a fallback function that reverts any payment, the attacker can win any auction. When it tries to refund the old leader, it reverts if the refund fails. This means that a malicious bidder can become the leader while making sure that any refunds to their address will *always* fail.

### `Mitigation`

External calls can fail accidentally or deliberately. To minimize the damage
caused by such failures, it is often better to isolate each external call into
its own transaction that can be initiated by the recipient of the call. This is
especially relevant for payments, where it is better to let users withdraw funds
rather than push funds to them automatically. (This also reduces the chance
of [problems with the gas
limit](https://consensys.github.io/smart-contract-best-practices/known_attacks#dos-with-block-gas-limit).)
Avoid combining multiple transfer() calls in a single transaction. Charities
contract limits the refund function to the contract owner.
