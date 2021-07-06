import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { generatePermitDigest, sign } from "../../relay-server/src/relay-order-lib/utils";
import { Approve } from "../../relay-server/src/relay-order-lib/types";
import { Dai, RelayProxy, RelayProxy__factory, Dai__factory } from "../typechain";
const { deployContract } = waffle;

describe("RelayProxy", () => {
  let relayProxy: RelayProxy;
  let dai: Dai;
  let approve: Approve;
  let deployerAddress: string;
  let spenderAddress: string;
  let vaultAddress: string;
  let relayProxyAddress: string;
  let version: string;
  let name: string;

  const decimals = 1e18
  const mintAmount: BigNumber = BigNumber.from("99000000000000000000");
  const value: BigNumber = BigNumber.from("10000000000000000000");
  const chainId = 31337 // buidlerevm chain id;
  const nonce = 0;
  const expiry = Date.now() + 120;
  const pk = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

  beforeEach(async() =>{
    const [deployer, spender, vault] = await ethers.getSigners();
    deployerAddress = await deployer.getAddress()
    spenderAddress = await spender.getAddress()
    vaultAddress = await vault.getAddress()

    const daiFactory = (await ethers.getContractFactory("Dai", deployer)) as Dai__factory
    dai = await daiFactory.deploy(chainId)
    await dai.deployed()
    name = await dai.name();
    version = await dai.version();

    const relayProxyFactory = (await ethers.getContractFactory("RelayProxy", deployer)) as RelayProxy__factory
    relayProxy = await relayProxyFactory.deploy(dai.address)
    await relayProxy.deployed()
    relayProxyAddress = relayProxy.address;

    // Mint some dai tokens for deployer
    await dai.mint(deployerAddress, mintAmount);
    expect(await dai.balanceOf(deployerAddress)).to.eq(mintAmount)
  })

  it("Should successfully permit spender and submit limit order", async () => {
    approve = {
      spender: relayProxyAddress,
      holder: deployerAddress,
      allowed: true
    }

    const digest = await generatePermitDigest(dai.address, version, name, chainId, nonce, expiry, approve);
    const sig = sign(digest, pk)

    await relayProxy.submitDaiLimitOrder(approve.holder, approve.spender, nonce, expiry, approve.allowed, sig.v, sig.r, sig.s, vaultAddress, value)

    const holderBalance: BigNumber = mintAmount.sub(value)

    expect(await dai.balanceOf(approve.holder)).to.eq(holderBalance)
    expect(await dai.balanceOf(vaultAddress)).to.eq(value)
  })
})