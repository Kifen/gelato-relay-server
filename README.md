# gelato-relay-server
A relay server to handle meta transactions for **Dai** tokens to **Gelato**. This project is comoposed of:

- **relay-server**: Server code.
- **relay-proxy**: Relay proxy smart contract.

### Build and Install Dependencies
```
$ git clone git@github.com:Kifen/gelato-relay-server.git
$ cd gelato-relay-server/relay-server
$ npm install

$cd gelato-relay-server/relay-proxy
$ npm install
```

### Run Relay Server
Go to directory **relay-server**:
- Open a terminal and run `npm run serve`
- In another new terminal run CLI `npx ts-node scripts/run.ts -a <inputAmount> -m <minReturn>`
