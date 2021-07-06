import { ChainId, Handler } from "@gelatonetwork/limit-orders-lib";
import axios from 'axios';
import { BigNumberish, Signature, Wallet } from 'ethers';
import config from '../../config';
import { providerIsValid, signerIsValid, generatePermitDigest, sign, daiContract } from './utils';

export const submitLimitOrder = async (
  signerOrProvider: Wallet,
  inputToken: string,
  outputToken: string,
  inputAmount: BigNumberish,
  minReturn: BigNumberish,
  handler: Handler,
  chainId: ChainId,  
  expiry: number,
  pk: string,
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
  
  const digest = await generatePermitDigest(config.DAI_ADDRESS, config.DAI_VERSION, config.DAI_NAME,chainId, nonce, expiry, approve);
  const signature = sign(digest, pk)
  const data = {
    signature: {
      v: signature.v,
      r: signature.r,
      s: signature.s,
    },
    inputToken,
    outputToken,
    minReturn,
    owner,
    inputAmount,
    approve,
    nonce,
    expiry,
  }

  axios({
    method: 'post',
    url: config.RELAYER_SERVER_URL,
    data: data,
  })
}
