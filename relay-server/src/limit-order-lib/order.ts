import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from "@ethersproject/abstract-provider";
import { ChainId, Handler } from "@gelatonetwork/limit-orders-lib";
import { Approve, MAX_INT } from './types';
import { utils, BigNumberish, Signature } from 'ethers';
import config from '../../config';
import { providerIsValid, signerIsValid, generateSignature, daiContract } from './utils';

export const submitLimitOrder = async (
  signerOrProvider: Signer,
  inputToken: string,
  outputToken: string,
  inputAmount: BigNumberish,
  minReturn: BigNumberish,
  handler: Handler,
  chainId: ChainId,  
  expiry: number,
) => {
  if (!(chainId as ChainId)) throw new Error("NETWORK NOT SUPPORTED");
  if (!signerIsValid(signerOrProvider)) throw new Error("Invalid Signer");
  if (!providerIsValid(signerOrProvider)) throw new Error("Invalid Provider");

  const owner = await signerOrProvider?.getAddress();
  const contract = await daiContract(signerOrProvider);
  const nonce = await contract.nonces(owner);
  const approve = {
    spender: config.RELAYER_PROXY_ADDRESS,
    holder: owner,
    allowed: true
  }
  const signature = await generateSignature(signerOrProvider, chainId, nonce, expiry, approve);
}
