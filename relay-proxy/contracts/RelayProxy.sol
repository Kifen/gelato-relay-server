// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Dai.sol";

contract RelayProxy {

  Dai public dai;

  constructor(address _dai) public {
    dai = Dai(_dai);
  }

  // function submitDaiLimitOrder(uint8 v, bytes32 r, bytes32 s, address holder, address spender, uint256 nonce, uint256 expiry, uint256 amount, bool allowed, address vault, bytes calldata data) external {
  //   //dai.permit(holder, spender, nonce, expiry, allowed, v, r, s);

  // bytes memory _permitData = abi.encodeWithSelector(
  //     dai.permit.selector,
  //     holder,
  //     spender,
  //     nonce,
  //     expiry,
  //     allowed,
  //     v,
  //     r
  //     //s
  //   );

  // (bool permitSuccess, ) = address(dai).call(_permitData);
  // require(permitSuccess, "RelayProxy: Failed to set permission for spender");

  //   bytes memory _transferFromData = abi.encodeWithSelector(
  //     dai.transferFrom.selector,
  //     holder,
  //     vault,
  //     amount,
  //     data
  //   );

  // (bool transferFromSuccess, ) = address(dai).call(_transferFromData);
  // require(transferFromSuccess, "RelayProxy: Failed to transferFrom");
  // }
  function submitDaiLimitOrder(address holder, address spender, uint256 nonce, uint256 expiry,
                    bool allowed, uint8 v, bytes32 r, bytes32 s, address vault, uint256 value) external returns(bool){
    permit(holder, spender, nonce, expiry, allowed, v, r, s);
    uint256 spenderAllowance = dai.allowance(holder, spender);
    require(spenderAllowance > 0, "RelayProxy: Spender has insufficient alllowance");
    require(dai.transferFrom(holder, vault, value), "RelayProxy: Failed to submit Dai limit order");

    return true;
  }

  function permit(address holder, address spender, uint256 nonce, uint256 expiry,
                    bool allowed, uint8 v, bytes32 r, bytes32 s) internal {
    dai.permit(holder, spender, nonce, expiry, allowed, v, r, s);
  }
}
