import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { BigNumber, utils } from "ethers";
import { generatePermitDigest, sign, encodeSubmitOrder } from "../../relay-server/src/relay-order-lib/utils";
import { Approve } from "../../relay-server/src/relay-order-lib/types";
import { Dai, RelayProxy, RelayProxy__factory, Dai__factory } from "../typechain";
const { deployContract } = waffle;

describe("RelayProxy", () => {
  let relayProxy: RelayProxy;
  let dai: Dai;
  let approve: Approve;
  let deployerAddress: string;
  let mockModuleAddress: string;
  let spenderAddress: string;
  let vaultAddress: string;
  let ownerAddress: string;
  let relayProxyAddress: string;
  let version: string;
  let name: string;

  const decimals = 1e18
  const mintAmount: BigNumber = BigNumber.from("99000000000000000000");
  const minReturn: BigNumber = BigNumber.from("8000000000000000000");
  const inputAmount: BigNumber = BigNumber.from("9000000000000000000");

  const chainId = 31337 // buidlerevm chain id;
  const nonce = 0;
  const expiry = Date.now() + 120;
  const pk = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

  beforeEach(async() =>{
    const [deployer, spender, owner, vault, module] = await ethers.getSigners();
    deployerAddress = await deployer.getAddress()
    spenderAddress = await spender.getAddress()
    vaultAddress = await vault.getAddress()
    mockModuleAddress = await module.getAddress()
    ownerAddress = await owner.getAddress()

    const daiFactory = (await ethers.getContractFactory("Dai", deployer)) as Dai__factory
    dai = await daiFactory.deploy(chainId)
    await dai.deployed()
    name = await dai.name();
    version = await dai.version();

    const relayProxyFactory = (await ethers.getContractFactory("RelayProxy", deployer)) as RelayProxy__factory
    relayProxy = await relayProxyFactory.deploy(dai.address)
    await relayProxy.deployed()
    relayProxyAddress = relayProxy.address;

    approve = {
      spender: relayProxyAddress,
      holder: deployerAddress,
      allowed: true
    }

    // Mint some dai tokens for deployer
    await dai.mint(deployerAddress, mintAmount);
    expect(await dai.balanceOf(deployerAddress)).to.eq(mintAmount)
  })

  it("should decode a submit order data", async () => {
    const endodedSubmitData = encodeSubmitOrder(mockModuleAddress, dai.address, ETH, ownerAddress, minReturn, inputAmount, vaultAddress)

    const utilsDecodedData = new utils.AbiCoder().decode(
      ["address", "address", "address", "address", "bytes", "bytes32", "uint256", "address"],
      endodedSubmitData
    )

    const contractDecodedData = await relayProxy.decodeOrder(endodedSubmitData);

    expect(utilsDecodedData[0]).to.eq(contractDecodedData.module)
    expect(utilsDecodedData[1]).to.eq(contractDecodedData.inputToken)
    expect(utilsDecodedData[2]).to.eq(contractDecodedData.owner)
    expect(utilsDecodedData[3]).to.eq(contractDecodedData.witness)
    expect(utilsDecodedData[4]).to.eq(contractDecodedData.data)
    expect(utilsDecodedData[5]).to.eq(contractDecodedData.secret)
    expect(utilsDecodedData[6]).to.eq(contractDecodedData.value)
    expect(utilsDecodedData[7]).to.eq(contractDecodedData.vault)
  })

  it("Should successfully permit spender and submit limit order", async () => {
    const digest = await generatePermitDigest(dai.address, version, name, chainId, nonce, expiry, approve);
    const sig = sign(digest, pk)

    const endodedSubmitData = encodeSubmitOrder(mockModuleAddress, dai.address, ETH, ownerAddress, minReturn, inputAmount, vaultAddress)
 
    const tx = await relayProxy.submitDaiLimitOrder(approve.holder, approve.spender, nonce, expiry, approve.allowed, sig.v, sig.r, sig.s, endodedSubmitData)

    const holderBalance: BigNumber = mintAmount.sub(inputAmount)

    expect(await dai.balanceOf(approve.holder)).to.eq(holderBalance)
    expect(await dai.balanceOf(vaultAddress)).to.eq(inputAmount)
  })
})