import { Response, Request, NextFunction } from 'express';
import { BigNumberish, utils, Contract, providers, Wallet } from 'ethers';
import { Signer } from '@ethersproject/abstract-signer';
import ABI from "../../abi/dai.json";
//import RelayerABI from '../../build/contracts/RelayProxy.json';
import config from '../../config';
import { ECDSASignature } from 'ethereumjs-util'

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const daiContract = async (): Promise<Contract> => {
  const provider = new providers.JsonRpcProvider("https://ropsten.infura.io/v3/3041380a4fa34022b16d918dd300518f")
  const signer: Signer = new Wallet('4a99e893ee9142f1b8290513d0a0788ec01659713e9b667eee1c7167cf7db9df');
  const signerOrProvider  = await signer.connect(provider);
  return new Contract(config.DAI_ADDRESS, ABI.abi, signerOrProvider);
}

// export const permit = (holder: string, spender: string, nonce: BigNumberish, expiry: BigNumberish, allowed: boolean, sig: ECDSASignature): string => {
  
// }