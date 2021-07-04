const { expect } = require("chai");

describe("Dai", () => {
  it("Should permit spender", async () =>{
    const chainId = 3;
    const holder = "0x3581708b29bc5Bc1cfA835522579Af3b1000C9fb";
    const spender = "0x79C2CfEdeB9bA2cCdd9D6C9bc771243209949720";
    const nonce = 0;
    const expiry = 1625343340
    const allowed  = true;
    const v = 27
    const r = "0x9f47762088809004ffcb6c6291d9c9940900a47ef25fd49f74b9c54a4e47d0a5"
    const s = "0x37a2f407517e465b7a92e545f508171fd5a7e5f223c9e1c6adbba21e8321303a"
    const Dai = await ethers.getContractFactory("Dai");
    const dai = await Dai.deploy(chainId);
    await dai.deployed();

    // const tx = await dai.permit(holder, spender, nonce, expiry, allowed, v, r, s)

    // // wait until the transaction is mined
    // await tx.wait();
    // console.log(await this.dai.allowance(holder, spender))
    const see = await dai.see(holder, spender, nonce, expiry, allowed)
    console.log("SEE:", see);

    const addr = await dai.getAddress(holder, spender, nonce, expiry, allowed, v, r, s)
    console.log("ADDR: ", addr);
  })
})