# gelato-relay-server
A relay server that handles submission of **Dai** limit orders to **Gelato**. This project is comoposed of:

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

- create file `.env.development`, and the following keys:

  `NODE_ENV`=`development`

  `PORT`=`3000`

  `RPC_URL`=`<your Infura ropsten http URL>`

  `GELATO_PINE_CORE`=`0x36049D479A97CdE1fC6E2a5D2caE30B666Ebf92B`

  `PK`=`<your private key or private key of account that has dai tokens (0xE4a660cEa63638AC69f6897D088721F6c6ea9a90)>`

  `DAI_VERSION`=`1`

  `DAI_NAME`=`Dai Stablecoin`

  `DAI_ADDRESS`=`0xE4a660cEa63638AC69f6897D088721F6c6ea9a90`

  `RELAYER_PROXY_ADDRESS`=`0x19FD1540b4cB7756F3e23E85071aCd0F6f1eC6A1`

  `RELAYER_SERVER_URL`=`http://localhost:3000/api/v1/relay`

- Open a terminal and run `export NODE_ENV=development & npm run serve`
- In another new terminal run CLI `npx ts-node scripts/run.ts -a <inputAmount> -m <minReturn>`
