import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL,
      accounts: [`0x${process.env.PK}`],
      chainId: 3,
      gas: "auto",
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.5.12",
        settings: {
          optimizer: { enabled: true },
        },
      },
      {
        version: "0.8.6",
        settings: {
          optimizer: { enabled: true },
        },
      },
    ],
    overrides: {
      "contracts/Dai.sol": {
        version: "0.5.12",
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
