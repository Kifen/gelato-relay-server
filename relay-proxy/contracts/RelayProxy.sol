// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Dai.sol";

contract RelayProxy {

  address public dai;

  constructor(address _dai) public {
    dai = _dai;
  }

  function submitDaiLimitOrder(address holder, address spender, uint256 nonce, uint256 expiry,
                    bool allowed, uint8 v, bytes32 r, bytes32 s, bytes calldata _data
) external returns(bool){
    permit(holder, spender, nonce, expiry, allowed, v, r, s);
    uint256 spenderAllowance = Dai(dai).allowance(holder, spender);
    require(spenderAllowance > 0, "RelayProxy: Spender has insufficient alllowance");
    // require(dai.transferFrom(holder, vault, value), "RelayProxy: Failed to submit Dai limit order");

    bytes memory _data = encodeTokenOrder(_data, holder);
    (bool success, ) = dai.call(_data);
    require(success, "RelayProxy: Failed to submit Dai limit order");
    return true;
  }

  function permit(address holder, address spender, uint256 nonce, uint256 expiry,
                    bool allowed, uint8 v, bytes32 r, bytes32 s) internal {
    Dai(dai).permit(holder, spender, nonce, expiry, allowed, v, r, s);
  }

  function decodeOrder(bytes memory _data)  public
        pure
        returns (
            address module,
            address inputToken,
            address payable owner,
            address witness,
            bytes memory data,
            bytes32 secret,
            uint256 value,
            address vault
        ) {
           (module, inputToken, owner, witness, data, secret, value, vault) = abi.decode(
            _data,
            (address, address, address, address, bytes, bytes32, uint256, address)
        );
  }

    function encodeTokenOrder(
        bytes memory _data, address holder
    ) public view returns (bytes memory) {
        (
        address module,
        address inputToken,
        address payable owner,
        address witness,
        bytes memory data,
        bytes32 secret,
        uint256 value,
        address vault
    ) = decodeOrder(_data);

    return abi.encodeWithSelector(
                Dai(dai).transferFrom.selector,
                holder,
                vault,
                value,
                abi.encode(
                    module,
                    inputToken,
                    owner,
                    witness,
                    data,
                    secret
                )
            );
    }

}
