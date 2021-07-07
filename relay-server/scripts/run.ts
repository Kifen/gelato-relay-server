import {submitLimitOrder} from '../src/relay-order-lib';
import { Wallet, providers, BigNumber } from 'ethers';
import { PK, DAI_ADDRESS, RPC_URL } from "../src/relay-order-lib/constants";
console.log(PK, DAI_ADDRESS, RPC_URL)
const inputToken = DAI_ADDRESS; // DAI
const outputToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // ETH
const inputAmount: BigNumber = BigNumber.from("11000000000000000000");
const minReturn: BigNumber = BigNumber.from("3000000000000000000");

const run = (async () => {
  const provider = new providers.JsonRpcProvider(RPC_URL)
  const pk = PK
  const signer = new Wallet(pk);
  const signerOrProvider  = await signer.connect(provider);
  await submitLimitOrder(signerOrProvider, inputToken, outputToken, inputAmount, minReturn, "uniswap", 3, Date.now() + 120, pk);
})()