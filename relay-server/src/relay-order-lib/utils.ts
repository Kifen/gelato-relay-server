import { Wallet, utils, BigNumberish, Signature, Contract, providers } from 'ethers';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from "@ethersproject/abstract-provider";
import { ecsign, ECDSASignature, keccak256, bufferToHex } from "ethereumjs-util";
import { Approve } from './types';
import config from '../../config';
import ABI from "../../abi/dai.json";
import Web3 from 'web3';

import { signDaiPermit } from 'eth-permit';

// The PERMIT_TYPEHASH was gotten from https://github.com/makerdao/dss/blob/3f30552a586264b32ebdb5bac94ba67020282e53/src/dai.sol#L59
export const PERMIT_TYPEHASH = '0xea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb';

export const generateDomainSeparator = (name: string, daiAddress: string, chainId: number, version: string): string => {
  const encodedData = new utils.AbiCoder().encode(
    ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
    [
      utils.keccak256(utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
      utils.keccak256(utils.toUtf8Bytes(name)),
      utils.keccak256(utils.toUtf8Bytes(version)),
      chainId,
      daiAddress
    ]
  )

  return utils.keccak256(encodedData);
}

export const generateDaiDigest = (version: string, name: string, chainId: number, nonce: BigNumberish, expiry: BigNumberish, approve: Approve): string => {
  const DOMAIN = "0xc2b22ec1d5d3f57ee203ad7ef46fdafd629abff9ed7392c7533b7ee2b32f8082"
  const DOMAIN_SEPARATOR = generateDomainSeparator(name, config.DAI_ADDRESS, chainId, version);
  console.log("DOMAIN_SEPARATOR: ", DOMAIN_SEPARATOR)
  const encodePacked = utils.solidityPack(
    ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
    [
      "0x19",
      '0x01', 
      DOMAIN_SEPARATOR,
      utils.keccak256(new utils.AbiCoder().encode(
        ['bytes32', 'address', 'address', 'uint256', 'uint256', 'bool'],
        [PERMIT_TYPEHASH, approve.holder, approve.spender, nonce, expiry, approve.allowed]
      ))
    ]
  )
  return utils.keccak256(encodePacked);
}

export const generateSignature = async (web3: Web3, signerOrProvider: Wallet, chainId: number, nonce: BigNumberish, expiry: BigNumberish, approve: Approve): Promise<Signature> => {
  const digest = generateDaiDigest(config.DAI_VERSION, config.DAI_NAME, chainId, nonce, expiry, approve);
  console.log("SEE: ", digest)
  console.log("EXPIRY: ", expiry)
  const digestBytes = utils.arrayify(digest)

  const signature = await signerOrProvider.signMessage(digestBytes)
  const recoveredAddress = utils.verifyMessage(digestBytes, signature);
  const sig = utils.splitSignature(signature); 
  console.log("recoveredAddress: ", recoveredAddress)
  const hashMsg = utils.hashMessage(digestBytes)
  console.log("MAIN: ", utils.recoverAddress(digestBytes, {r: sig.r, s: sig.s, v: sig.v}))
  console.log(utils.splitSignature(signature))


  const contract = await daiContract(signerOrProvider);
  const addr = await contract.permit(approve.holder, approve.spender, nonce, expiry, approve.allowed, sig.v, sig.r, sig.s)
  console.log("FROM: ", addr)
  return utils.splitSignature(signature); 
}

export const signerIsValid = (signer: Signer): boolean => {
  if (Signer.isSigner(signer)) return true;
  return false;
}

export const providerIsValid = (signerOrProvider: Signer): boolean => {
  const provider = Provider.isProvider(signerOrProvider) 
    ? signerOrProvider
    : Signer.isSigner(signerOrProvider)
    ? signerOrProvider.provider
    : undefined;

  if (provider === undefined) return false;

  return true;
}

export const daiContract = async (provider: Signer): Promise<Contract> => {
  return new Contract(config.DAI_ADDRESS, ABI.abi, provider);
}
