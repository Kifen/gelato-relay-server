import { Wallet, utils, BigNumberish, Signature, Contract, providers } from 'ethers';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from "@ethersproject/abstract-provider";
import { Approve, FullSecret} from './types';
import ABI from "../../abi/dai.json";
import { ecsign, ECDSASignature } from 'ethereumjs-util'
import { DAI_ADDRESS, DAI_VERSION, DAI_NAME, PK } from "./constants";

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

export const generatePermitDigest = (daiAddress: string, version: string, name: string, chainId: number, nonce: BigNumberish, expiry: BigNumberish, approve: Approve): string => {
  const DOMAIN_SEPARATOR = generateDomainSeparator(name, daiAddress, chainId, version);
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

// export const generateSignature = async (daiAddress: string, chainId: number, nonce: BigNumberish, expiry: BigNumberish, approve: Approve): Promise<ECDSASignature> => {
//   const digest = generatePermitDigest(daiAddress, DAI_VERSION, DAI_NAME, chainId, nonce, expiry, approve);
//   const signature = sign(digest, PK)
//   return signature; 
// }

export const sign = (digest: any, privateKey: string): ECDSASignature => {
  return ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(privateKey, 'hex'))
}

export const encodeSubmitOrder = (module: string, inputToken: string, outputToken: string, owner: string, minReturn: BigNumberish, inputAmount: BigNumberish, vault: string, handlerAddress?: string): string => {
    const randomSecret = utils.hexlify(utils.randomBytes(13)).replace("0x", "")
    const {secret, witness} = fullSecret(randomSecret)
    console.log("secret:: ", secret, witness)
    const data = encodedData(outputToken, minReturn, handlerAddress)
    return new utils.AbiCoder().encode(
      ["address", "address", "address", "address", "bytes", "bytes32", "uint256", "address"],
      [module, inputToken, owner, witness, data, secret, inputAmount, vault]
    )
}

export const fullSecret = (randomSecret: string): FullSecret => {
  const fullSecret = `0x4200696e652e66696e616e63652020d83ddc09${randomSecret}`;
  const { privateKey: secret, address: witness } = new Wallet(fullSecret);
  return {
    secret,
    witness
  }
}

export const encodedData = (outputToken: string, minReturn: BigNumberish, gelatoHandler?: string): string => {
  const encodedData = gelatoHandler
  ? new utils.AbiCoder().encode(
      ["address", "uint256", "address"],
      [outputToken, minReturn, gelatoHandler]
    )
  : new utils.AbiCoder().encode(
      ["address", "uint256"],
      [outputToken, minReturn]
    ); 

    return encodedData;
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
  return new Contract(DAI_ADDRESS, ABI.abi, provider);
}
