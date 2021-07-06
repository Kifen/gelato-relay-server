import { Request, Response, NextFunction } from 'express';
import { RelayerOrder } from '../relay-order-lib/types';
import { daiContract } from './utils';

export const relay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const data: RelayerOrder = req.body;
  console.log(data);
  const contract = await daiContract();
  // await contract.permit(data.approve.holder, data.approve.spender, data.nonce, data.expiry, true, data.signature.v, data.signature.r, data.signature.s)
  res.status(200).json({
    success: true
});
}