Design patterns
===============

Circuit Breaker
---------------

Circuit Breakers are design patterns that allow contract functionality to be
stopped. This would be desirable in situations where there is a live contract
where a bug has been detected. Freezing the contract would be beneficial for
reducing harm before a fix can be implemented.

Circuit breaker in the contract was set up to permit certain functions in
certain situations. For example, if you are implementing a withdrawal pattern,
you might want to stop people from depositing funds into the contract if a bug
has been detected, while still allowing accounts with balances to withdraw their
funds.

In Charities contract I wanted to restrict access to the accounts that can
modify the stopped state variable to the contract owner.

**Restricting Access**

You cannot prevent people or computer programs from reading your contracts’
state. The state is publicly available information for anyone with access to the
blockchain.

However, you can restrict other contracts’ access to the state by making state
variables private.

In charities contract there are restricted functions so that only specific
addresses are permitted to execute functions.
