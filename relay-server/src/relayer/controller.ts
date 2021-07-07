import { Request, Response, NextFunction } from 'express';
import { RelayerOrder } from '../relay-order-lib/types';
import { relayProxyContract } from './utils';
import { utils } from 'ethers';
import { generatePermitDigest, encodeSubmitOrder, encodedData, fullSecret } from "../relay-order-lib/utils";
import { GELATO_LIMIT_ORDERS_MODULE_ADDRESS } from "../relay-order-lib/constants";

export const relay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const data: RelayerOrder = req.body;
  console.log(data);
  const contract = await relayProxyContract();
  const moduleAddress = GELATO_LIMIT_ORDERS_MODULE_ADDRESS[data.chainId];
  const keyData = encodedData(data.outputToken, data.minReturn)
  const randomSecret = utils.hexlify(utils.randomBytes(13)).replace("0x", "")
  const { witness, secret} = fullSecret(randomSecret);

  const vaultData = new utils.AbiCoder().encode(
    ["address", "address", "address", "address", "bytes"],
    [moduleAddress, data.inputToken, data.owner, witness, keyData]
  )

  const vaultAddress = await contract.getVault(utils.keccak256(vaultData))
  const endodedSubmitData = encodeSubmitOrder(moduleAddress, data.inputToken, data.outputToken, data.owner, data.minReturn, data.inputAmount, vaultAddress, undefined)
  console.log("endodedSubmitData: ", endodedSubmitData)
  // const order = await contract.decodeOrder(endodedSubmitData);
  // console.log(order)
  const options = { gasPrice: 500000, gasLimit: 2000000};
  const tx = await contract.submitDaiLimitOrder(data.approve.holder, data.approve.spender, data.nonce, data.expiry, data.approve.allowed, data.signature.v, data.signature.r, data.signature.s, endodedSubmitData)

  console.log(tx)

  console.log("Submitting Gelato Limit Order...")
  await tx.wait()
  console.log("DONE...")
  res.status(200).json({
    success: true
  });
}