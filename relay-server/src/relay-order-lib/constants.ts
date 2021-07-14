import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const RELAYER_SERVER_URL = process.env.RELAYER_SERVER_URL;
export const RELAYER_PROXY_ADDRESS = process.env.RELAYER_PROXY_ADDRESS;
export const DAI_ADDRESS = process.env.DAI_ADDRESS;
export const DAI_NAME = process.env.DAI_NAME;
export const DAI_VERSION = process.env.DAI_VERSION;
export const PK = process.env.PK;
export const GELATO_PINE_CORE = process.env.GELATO_PINE_CORE;
export const RPC_URL = process.env.RPC_URL;
export const PORT = process.env.PORT;

export const CHAIN_ID = {
  MAINNET: 1,
  ROPSTEN: 3,
  MATIC: 137,
  FANTOM: 250
};

export const GELATO_LIMIT_ORDERS_MODULE_ADDRESS = {
  [CHAIN_ID.MAINNET]: '0x037fc8e71445910e1E0bBb2a0896d5e9A7485318',
  [CHAIN_ID.ROPSTEN]: '0x3f3C13b09B601fb6074124fF8D779d2964caBf8B',
  [CHAIN_ID.MATIC]: '0x5A36178E38864F5E724A2DaF5f9cD9bA473f7903',
  [CHAIN_ID.FANTOM]: '0xf2253BF9a0BD002300cFe6f4E630d755669f6DCa'
};
