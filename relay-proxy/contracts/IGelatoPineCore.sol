// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

interface IGelatoPineCore {
    function vaultOfOrder(
        address _module,
        address _inputToken,
        address payable _owner,
        address _witness,
        bytes memory _data
    ) external view returns (address);

    function decodeOrder(bytes memory _data)
        external
        pure
        returns (
            address module,
            address inputToken,
            address payable owner,
            address witness,
            bytes memory data,
            bytes32 secret
        );
}
