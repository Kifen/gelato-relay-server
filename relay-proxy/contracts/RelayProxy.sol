// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Dai.sol";

contract RelayProxy {

  address public dai;
  address public gelatoPineCore;

 bytes32 public constant vaultCodeHash =
        bytes32(
            0xfa3da1081bc86587310fce8f3a5309785fc567b9b20875900cb289302d6bfa97
        );

 bytes public constant code =
        hex"6012600081600A8239F360008060448082803781806038355AF132FF";

  constructor(address _dai, address _gelato) public {
    dai = _dai;
    gelatoPineCore = _gelato;
  }

  function submitDaiLimitOrder(address holder, address spender, uint256 nonce, uint256 expiry,
                    bool allowed, uint8 v, bytes32 r, bytes32 s, bytes calldata _data
) external returns(bool){
    permit(holder, spender, nonce, expiry, allowed, v, r, s);
    bytes memory encodedTokenData = encodeTokenOrder(_data, holder);
    (bool success, ) = dai.call(encodedTokenData);
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

      function getVault(bytes32 _data) public view returns (address) {
        return
            address(
              uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            gelatoPineCore,
                            _data,
                            vaultCodeHash
                        )
                    )
                )
            )
            );
    }
}
