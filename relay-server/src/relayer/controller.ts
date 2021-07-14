import { Request, Response, NextFunction } from 'express';
import { RelayerOrder, TokenOrder, PermitData } from '../relay-order-lib/types';
import { relayProxyContract, daiContract } from './utils';
import { utils } from 'ethers';
import {
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
    inputToken: data.inputToken,
    owner: data.approve.holder,
    witness,
    limitOrderData,
    secret
  };
   
  const options = { gasPrice: utils.parseUnits("400", "gwei"), gasLimit: 1000000};
  const tx = await proxy.submitDaiLimitOrder(permitData, data.inputAmount, tokenOrder, options);

  console.log(tx)

  console.log('Submitted new DAI limit order...');
  res.status(200).json({
    success: true
  });
};
