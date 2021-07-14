import { ChainId } from '@gelatonetwork/limit-orders-lib';

export const MAX_INT =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export type Approve = {
  spender: string;
  holder: string;
  allowed: boolean;
};

export type Signature = {
  v: string;
  r: string;
  s: string;
};

export type FullSecret = {
  secret: string;
  witness: string;
};

export type PermitData = {
  nonce: number;
  expiry: number;
  allowed: boolean;
  v: number;
  r: string;
  s: string;
};

export type TokenOrder = {
  module: string;
  inToken: string;
  owner: string;
  witness: string;
  limitOrderData: string;
  secret: string;
};

export type RelayerOrder = {
  signature: Signature;
  inputToken: string;
  outputToken: string;
  minReturn: number;
  inputAmount: number;
  approve: Approve;
  nonce: number;
  expiry: number;
  chainId: ChainId;
};
