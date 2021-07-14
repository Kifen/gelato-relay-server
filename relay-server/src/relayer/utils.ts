import { Response, Request, NextFunction } from 'express';
import { BigNumberish, utils, Contract, providers, Wallet } from 'ethers';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/abstract-provider';
import DaiABI from '../../abi/dai.json';
import RelayerABI from '../../abi/relayProxy.json';
import {
  DAI_ADDRESS,
  RPC_URL,
  PK,
  RELAYER_PROXY_ADDRESS
} from '../relay-order-lib/constants';
import { ECDSASignature } from 'ethereumjs-util';

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const daiContract = async (): Promise<Contract> => {
  const signer: Signer = new Wallet(PK);
  const signerOrProvider = await signer.connect(provider());
  return new Contract(DAI_ADDRESS, DaiABI.abi, signerOrProvider);
};

export const relayProxyContract = async (): Promise<Contract> => {
  // const provider = new providers.JsonRpcProvider("https://ropsten.infura.io/v3/3041380a4fa34022b16d918dd300518f")
  const signer: Signer = new Wallet(PK);
  const signerOrProvider = await signer.connect(provider());
  return new Contract(RELAYER_PROXY_ADDRESS, RelayerABI.abi, signerOrProvider);
};

export const provider = (): Provider => {
  return new providers.JsonRpcProvider(RPC_URL);
};
