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

// export const getVault = (module: string, inputToken: string, owner: string, witness: string, data: string): string => {
//   const salt = key(module, inputToken, owner, witness, data)
//   const vaultCode = "0xfa3da1081bc86587310fce8f3a5309785fc567b9b20875900cb289302d6bfa97"
//   const vaultCodeHash = utils.keccak256(vaultCode)

//   return utils.keccak256(
//     utils.solidityPack(
//       ['bytes1', 'address', 'bytes32', 'bytes32'],
//       ['0xff', config.GELATO_PINE_CORE, salt, vaultCodeHash]
//     )
//   )
// }

// export const key = (module: string, inputToken: string, owner: string, witness: string, data: string): string => {
//   return new utils.AbiCoder().encode(
//     ["address", "address", "address", "address", "bytes"],
//     [module, inputToken, owner, witness, data]
//   )
// }