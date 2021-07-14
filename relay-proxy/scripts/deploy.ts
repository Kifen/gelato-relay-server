// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from 'hardhat';
import { Contract, ContractFactory } from 'ethers';
import dotenv from 'dotenv'

dotenv.config()
async function main(): Promise<void> {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await run('compile');

  // We get the contract to deploy
  console.log("Deploying Dai Contract...")
  const DaiFactory: ContractFactory = await ethers.getContractFactory("Dai");
  const dai: Contract = await DaiFactory.deploy(3);
  await dai.deployed();
  console.log("Dai deployed to:", dai.address);

  console.log("Deploying RelayProxy Contract...")
  const relayProxyFactory: ContractFactory = await ethers.getContractFactory("RelayProxy");
  const relayProxy: Contract = await relayProxyFactory.deploy(dai.address);
  await relayProxy.deployed();
  console.log("RelayProxy deployed to:", relayProxy.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
