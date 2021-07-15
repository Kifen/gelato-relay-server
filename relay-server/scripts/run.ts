import {submitLimitOrder} from '../src/relay-order-lib';
import { Wallet, providers, BigNumber } from 'ethers';
import { PK, DAI_ADDRESS, RPC_URL } from "../src/relay-order-lib/constants";
import { program } from "commander";

const inputToken = DAI_ADDRESS; // DAI
const outputToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // ETH


program
  .requiredOption('-a, --amount <type>', 'amount to swap')
  .requiredOption('-m, --minreturn <type>', 'minimum amount expected')

program.parse(process.argv);
const options = program.opts();

let inputAmount: BigNumber = BigNumber.from(`${options.amount}000000000000000000`);
let minReturn: BigNumber = BigNumber.from(`${options.minreturn}000000000000000000`);

const run = (async () => {
  if(!check()) {
    console.log("Minimum return amount cannot be greater than the input amount")
    return;
  }

  const provider = new providers.JsonRpcProvider(RPC_URL)
  const pk = PK
  const signer = new Wallet(pk);
  const signerOrProvider  = await signer.connect(provider);
  await submitLimitOrder(signerOrProvider, inputToken, outputToken, inputAmount, minReturn, 3, Date.now() + 240, pk);
})()

function check(): boolean {
  if (parseInt(options.amount) < parseInt(options.minreturn)) return false;
  return true;
}