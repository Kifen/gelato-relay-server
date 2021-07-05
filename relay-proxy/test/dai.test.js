const { expect } = require("chai");

describe("Dai", () => {
  it("Should permit spender", async () =>{
    const chainId = 3;
    const holder = "0x3581708b29bc5Bc1cfA835522579Af3b1000C9fb";
    const spender = "0x79C2CfEdeB9bA2cCdd9D6C9bc771243209949720";
    const nonce = 0;
    const expiry = 1625488544971
    const allowed  = true;
    const v = 27
    const r = "0x34c39f00db53aa74857cd3733276c3989b6cebd2e5bd728083227fb9983dced3"
    const s = "0x70a8bcfa03a223702fd682fbe8e29cfcb6d3c43f462456590b0848fd544fa293"
    const Dai = await ethers.getContractFactory("Dai");
    const dai = await Dai.deploy(chainId);
    await dai.deployed();

    // const tx = await dai.permit(holder, spender, nonce, expiry, allowed, v, r, s)

    // // wait until the transaction is mined
    // await tx.wait();
    // console.log(await this.dai.allowance(holder, spender))
    const see = await dai.see(holder, spender, nonce, expiry, allowed)
    console.log("SEE:", see);
    console.log("DOMAIN: ", await dai.domain())
    const addr = await dai.getAddress(holder, spender, nonce, expiry, allowed, v, r, s)
    console.log("ADDR: ", addr);
  })
})