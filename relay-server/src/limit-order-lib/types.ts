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