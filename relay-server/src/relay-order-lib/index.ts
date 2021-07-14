import { ChainId, Handler } from '@gelatonetwork/limit-orders-lib';
import axios from 'axios';
import { bufferToHex } from 'ethereumjs-util';
import { BigNumberish, Signature, Wallet } from 'ethers';
import {
  providerIsValid,
  signerIsValid,
  generatePermitDigest,
  sign,
  daiContract
} from './utils';
import {
  DAI_ADDRESS,
  DAI_VERSION,
  DAI_NAME,
  RELAYER_PROXY_ADDRESS,
  RELAYER_SERVER_URL
} from './constants';

export const submitLimitOrder = async (
  signerOrProvider: Wallet,
  inputToken: string,
  outputToken: string,
  inputAmount: BigNumberish,
  minReturn: BigNumberish,
  handler: Handler,
  chainId: ChainId,
  expiry: number,
  pk: string
) => {
  if (!(chainId as ChainId)) throw new Error('NETWORK NOT SUPPORTED');
  if (!signerIsValid(signerOrProvider)) throw new Error('Invalid Signer');
  if (!providerIsValid(signerOrProvider)) throw new Error('Invalid Provider');

  const owner = await signerOrProvider?.getAddress();
  const contract = await daiContract(signerOrProvider);
  let nonce = await contract.nonces(owner);

  const approve = {
    spender: RELAYER_PROXY_ADDRESS,
    holder: owner,
    allowed: true
  };

  const digest = await generatePermitDigest(
    DAI_ADDRESS,
    DAI_VERSION,
    DAI_NAME,
    chainId,
    nonce,
    expiry,
    approve
  );
  const signature = sign(digest, pk);
  const data = {
    signature: {
      v: signature.v,
      r: bufferToHex(signature.r),
      s: bufferToHex(signature.s)
    },
    inputToken,
    outputToken,
    minReturn,
    inputAmount,
    approve,
    nonce: nonce++,
    expiry,
    chainId
  };

  console.log(data);
  axios({
    method: 'post',
    url: RELAYER_SERVER_URL,
    data: data
  });
};
