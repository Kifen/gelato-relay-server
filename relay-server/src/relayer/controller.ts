import { Request, Response, NextFunction } from 'express';
import { RelayerOrder, TokenOrder, PermitData } from '../relay-order-lib/types';
import { relayProxyContract, daiContract } from './utils';
import { utils } from 'ethers';
import {
  generatePermitDigest,
  encodeSubmitOrder,
  encodedData,
  fullSecret
} from '../relay-order-lib/utils';
import { GELATO_LIMIT_ORDERS_MODULE_ADDRESS } from '../relay-order-lib/constants';

export const relay = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const data: RelayerOrder = req.body;
  const dai = await daiContract();
  const proxy = await relayProxyContract();

  const moduleAddress = GELATO_LIMIT_ORDERS_MODULE_ADDRESS[data.chainId];
  const limitOrderData = encodedData(data.outputToken, data.minReturn);
  const randomSecret = utils.hexlify(utils.randomBytes(13)).replace('0x', '');
  const { witness, secret } = fullSecret(randomSecret);

  // const vaultData = new utils.AbiCoder().encode(
  //   ["address", "address", "address", "address", "bytes"],
  //   [moduleAddress, data.inputToken, data.owner, witness, keyData]
  // )

  const permitData = {
    nonce: data.nonce,
    expiry: data.expiry,
    allowed: data.approve.allowed,
    v: data.signature.v,
    r: data.signature.r,
    s: data.signature.s
  };

  const tokenOrder = {
    module: moduleAddress,
    inToken: data.inputToken,
    owner: data.approve.holder,
    witness,
    limitOrderData,
    secret
  };
  // const PermitData =
  // const orderKey = utils.keccak256(vaultData)
  // const vaultAddress = await contract.getVault(orderKey)
  // console.log("Order key: ", orderKey)
  // console.log("Vault address: ", vaultAddress)

  // const endodedSubmitData = encodeSubmitOrder(moduleAddress, data.inputToken, data.outputToken, data.owner, data.minReturn, data.inputAmount, vaultAddress, undefined)

  // console.log(permitData, data.inputAmount, tokenOrder);
  const options = { gasPrice: utils.parseUnits("400", "gwei"), gasLimit: 1000000};
  const tx = await proxy.submitDaiLimitOrder(permitData, data.inputAmount, tokenOrder, options);
  console.log(tx)


  // const daiAddress = await dai.getAddress(tokenOrder.owner, "0xf6Dc11b6317F37A9a978ebBDB11CE7FC301C2828", permitData.nonce, permitData.expiry, permitData.allowed, permitData.v, permitData.r, permitData.s)
  // const proxyAddr = await proxy.getAddress(tokenOrder, permitData)
  // console.log("Address ", proxyAddr == daiAddress)
  // console.log("Address ", proxyAddr == "0x453B7140A2B077760C37d2087627c6450c56F3aE")
  // console.log('Submitting Gelato Limit Order...');
  // const vault = await proxy.vault(tokenOrder, options)
  // console.log("Vault: ", vault)
  // await tx.wait()
  console.log('DONE...');
  res.status(200).json({
    success: true
  });
};
