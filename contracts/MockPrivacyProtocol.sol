// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPrivacyProtocol
 * @notice A simple mock contract for testing adapter infrastructure
 * @dev This is a placeholder. Real protocol contracts will be added later.
 */
contract MockPrivacyProtocol {
    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed recipient, uint256 amount);
    event Transfer(bytes32 indexed commitment);

    function deposit() external payable {
        require(msg.value > 0, "Must deposit non-zero amount");
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(address payable recipient, uint256 amount) external {
        require(amount > 0, "Must withdraw non-zero amount");
        require(address(this).balance >= amount, "Insufficient balance");
        
        recipient.transfer(amount);
        emit Withdraw(recipient, amount);
    }

    function transfer(bytes32 commitment) external {
        emit Transfer(commitment);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
