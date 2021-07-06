export const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export type Approve = {
  spender: string;
  holder: string;
  allowed: boolean;
}

export type Signature = {
  v: string;
  r: string;
  s: string;
}

export type RelayerOrder = {
  signature: Signature;
  inputToken: string;
  outputToken: string;
  minReturn: number;
  owner: string;
  inputAmount: number;
  approve: Approve;
  nonce: number;
  expiry: number;
}
