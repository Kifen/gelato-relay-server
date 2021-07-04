import { utils, BigNumberish, Signature, Contract, providers } from 'ethers';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from "@ethersproject/abstract-provider";
import abi from "ethereumjs-abi";
import { Approve } from './types';
import config from '../../config';
import ABI from "../../abi/dai.json";

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
  const encodePacked = utils.solidityPack(
    ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
    [
      "0x19",
      '0x01', 
      DOMAIN,
      utils.keccak256(new utils.AbiCoder().encode(
        ['bytes32', 'address', 'address', 'uint256', 'uint256', 'bool'],
        [PERMIT_TYPEHASH, approve.holder, approve.spender, nonce, expiry, approve.allowed]
      ))
    ]
  )
  return utils.keccak256(encodePacked);
}

export const generateSignature = async (signerOrProvider: Signer, chainId: number, nonce: BigNumberish, expiry: BigNumberish, approve: Approve): Promise<Signature> => {
  const digest = generateDaiDigest(config.DAI_VERSION, config.DAI_NAME, chainId, nonce, expiry, approve);
  console.log("SEE: ", digest)
  const messageHashBytes = utils.arrayify(digest)
  const flatSig = await signerOrProvider.signMessage(messageHashBytes)
  const sig = utils.splitSignature(flatSig)
  console.log(sig)
  console.log(utils.recoverAddress(messageHashBytes, {r: sig.r, v: sig.v, s: sig.s}))
  return utils.splitSignature(flatSig); 
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

export const typedData = async (signerOrProvider: Signer, nonce: BigNumberish, expiry: BigNumberish, approve: Approve) => {
  const domain = {
    name: 'Dai Stablecoin',
    version: '1',
    chainId: 3,
    verifyingContract: '0x79C2CfEdeB9bA2cCdd9D6C9bc771243209949720'
  };

  const types = {
    Permit: [
      { name: "holder", type: "address" },
      { name: "spender", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" },
      { name: "allowed", type: "bool" },
  ],
  }

  const value = {
    holder: approve.holder, 
    spender: approve.spender,
    nonce,
    expiry,
    allowed: approve.allowed
  }

  signerOrProvider.
}
