Final project developer bootcamp 2019 – charities
-------------------------------------------------

This dApp gives you the possibility to work with charities. You can create,
donate, confirm consumation and close charities. It was developed as final
project in the developer bootcamp 2019 and is a truffle project with
drizzle+react as frontend. It uses Safemath library for buffer over and underflows
The circuit breaker (pause contract functionality) was implemented for two functions.

[Screenshot](https://github.com/8locktec/charities/blob/master/screenshot-dapp.PNG)

[Screencast](https://drive.google.com/file/d/16v1sQk1UFL5tqEbnH31bMOw01GrvXa2T/view?usp=sharing)

### `Requirements`

-   [Node.js v8+ LTS and npm](https://nodejs.org/en/). Npm version 10.16.0.

-   Truffle: npm install truffle -g. To check if it is installed properly,
    type truffle version on your terminal.

-   Ganache-(cli): npm install ganache-cli -g. Ganache will be used to spin up a
    personal, local Ethereum blockchain with dummy accounts for dev purpose.
    Alternative install Ganache for windows. Set the port to 8545 if not already
    done.

-   Metamask plugin ( or remix) for interaction with the contracts.

### `Setup dev environment`

-   Checkout project

-   go to front folder and start npm install

-   Start your ganache-(cli) with ganache-cli

-   Go to main folder and start: truffle migrate --reset

-   Start the tests with: truffle test

-   Start your browser and login to your metamask account. Important! Change the
    network to your local network and import the private key of account 0 from
    ganache-(cli). You can also connect with your remix instance if preferred.

-   Important! Change to the front/src directory. Delete the folder contracts
    first. Add a symlink director contracts to ..\\..\\build\\contracts in this
    directory in WIN 10 with

>   mklink contracts ..\\..\\build\\contracts /J

>   under LINUX cd src  
>   ln -s ../../build/contracts contracts

-   go to front folder and start the dApp with npm start (start on other port if 3000 is in use)
