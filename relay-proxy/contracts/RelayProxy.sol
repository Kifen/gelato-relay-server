// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import {IDai} from "./IDai.sol";
import {IERC20OrderRouter} from "./IERC20OrderRouter.sol";

contract RelayProxy {
    IDai public immutable dai;
    IERC20OrderRouter public immutable erc20OrderRouter;

    struct PermitData {
        uint256 nonce;
        uint256 expiry;
        bool allowed;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct TokenOrder {
        address module;
        address inputToken;
        address payable owner;
        address witness;
        bytes limitOrderData;
        bytes32 secret; // only here for subgraph indexing
    }

    constructor(IDai _dai, IERC20OrderRouter _erc20orderRouter) {
        dai = _dai;
        erc20OrderRouter = _erc20orderRouter;
    }

    /// @param _tokenOrder needs to follow format and must be last param
    function submitDaiLimitOrder(
        PermitData calldata _permitData,
        uint256 _amount,
        TokenOrder calldata _tokenOrder
    ) external {
        dai.permit(
            _tokenOrder.owner,
            address(this),
            _permitData.nonce,
            _permitData.expiry,
            _permitData.allowed,
            _permitData.v,
            _permitData.r,
            _permitData.s
        );

        dai.transferFrom(
            _tokenOrder.owner,
            address(this),
            _amount
        );

        // set Approval for Gelato Erc200rderRouter
        dai.approve(address(erc20OrderRouter), _amount);

        erc20OrderRouter.depositToken(_amount, _tokenOrder.module, _tokenOrder.inputToken, _tokenOrder.owner, _tokenOrder.witness, _tokenOrder.limitOrderData, _tokenOrder.secret);
    }
}
