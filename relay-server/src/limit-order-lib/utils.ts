import { utils, BigNumberish, Signature, Contract } from 'ethers';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from "@ethersproject/abstract-provider";
import { Approve, DAI_ABI } from './types';
import config from '../../config';
import ABI from "../../abi/dai.json";

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
  const DOMAIN_SEPARATOR = generateDomainSeparator(name, config.DAI_ADDRESS, chainId, version)
  const encodePacked = utils.solidityPack(
    ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
    [
      '0x19', 
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

export const generateSignature = async (signerOrProvider: Signer, chainId: number, nonce: BigNumberish, expiry: BigNumberish, approve: Approve): Promise<Signature> => {
  const digest = generateDaiDigest(config.DAI_VERSION, config.DAI_NAME, chainId, nonce, expiry, approve);
  const data = await signerOrProvider.signMessage(digest)
  return utils.splitSignature(data); 
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
