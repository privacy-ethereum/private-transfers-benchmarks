import { parseAbiItem, type Address } from "viem";

import type { ProtocolConfig } from "../utils/types.js";

/**
 * FHERC20 Confidential Ether eETH:
 */
const CONFIDENTIAL_ETHER_PROXY: Address = "0xC132c8a82A24Fe1e491082932e3db4F70Ce95c93";

/**
 * ConfidentialETH.shieldNative function (inherited from FHERC20NativeWrapperUpgradeable.sol):
 *
 * Emits:
 * TaskCreated() - Assigned task to encrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to encrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to encrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to encrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to encrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to encrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to encrypt (emitted by Task Manager of Fhenix coprocessor)
 * Transfer() - Transfer to simulate a ERC20 transfer with dummy values (emitted by the confidential Eth contract)
 * ConfidentialTransfer() - Encrypted token transfer announcement (emitted by the confidential Eth contract)
 * ShieldedNative() - Shielded native ETH action (emitted by the confidential Eth contract)
 */
const ENCRYPT_ETH_EVENTS = [
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event ConfidentialTransfer(address indexed from, address indexed to, bytes32 indexed amount)"),
  parseAbiItem("event ShieldedNative(address indexed from, address indexed to, uint256 value)"),
] as const;

/**
 * ConfidentialETH.decrypt function:
 *
 * Emits:
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * Transfer() - Transfer to simulate a ERC20 transfer with dummy values (emitted by the confidential Eth contract)
 * ConfidentialTransfer() - Encrypted token transfer announcement (emitted by the confidential Eth contract)
 * Unshielded() - Unshielded native ETH action (emitted by the confidential Eth contract)
 */
const DECRYPT_ETH_EVENTS = [
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event ConfidentialTransfer(address indexed from, address indexed to, bytes32 indexed amount)"),
  parseAbiItem("event Unshielded(address indexed to, bytes32 indexed amount)"),
] as const;

/**
 * ConfidentialETH.claimAllDecrypted function:
 *
 * Emits:
 * ClaimedUnshielded() - Claimed unshielded ETH transfer notification (emitted by the confidential wrapper contract)
 *
 */
const CLAIM_DECRYPTED_ETH_EVENTS = [
  parseAbiItem(
    "event ClaimedUnshielded(address indexed to, bytes32 indexed unshieldRequestId, bytes32 indexed unshieldAmount, uint64 unshieldAmountCleartext)",
  ),
] as const;

/**
 * ConfidentialETH -> FHERC20NativeWrapperUpgradeable -> FHERC20Upgradeable.confidentialTransfer function:
 *
 * Emits:
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * TaskCreated() - Assigned task to decrypt (emitted by Task Manager of Fhenix coprocessor)
 * Transfer() - Transfer to simulate a ERC20 transfer with dummy values (emitted by the confidential Eth contract)
 * ConfidentialTransfer() - Encrypted token transfer announcement (emitted by the confidential Eth contract)
 *
 * It can be used by confidential ETH or confidential ERC20 tokens because both are FHERC20 confidential tokens.
 */
const ENCRYPTED_TOKEN_TRANSFER_EVENTS = [
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem(
    "event TaskCreated(uint256 indexed taskId, string descriptionHash, uint256 maxBudget, uint256 commitDeadline, uint256 revealDeadline)",
  ),
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event ConfidentialTransfer(address indexed from, address indexed to, bytes32 indexed amount)"),
] as const;

/** Redact configuration */
const REDACT_CONFIG = {
  name: "redact",
  version: "1.0.0",
  contracts: [
    {
      address: CONFIDENTIAL_ETHER_PROXY,
      sourceUrl:
        "https://github.com/FhenixProtocol/redact/blob/new-version-deployment/packages/hardhat/contracts/ConfidentialETH.sol",
    },
  ],
  operations: [
    {
      functionSourceUrl:
        "https://github.com/FhenixProtocol/fhenix-confidential-contracts/blob/0823e57e320c1c72e0caee7faeebc4d3a0710373/contracts/FHERC20/extensions/FHERC20NativeWrapperUpgradeable.sol#L91",
      exampleTxUrl:
        "https://sepolia.etherscan.io/tx/0xf1758a8d42ef208d4e20b00445a9c6b75aa8ae21c7fa6c5dcbdde78b1efa1ac1",
      events: ENCRYPT_ETH_EVENTS,
    },
    {
      functionSourceUrl:
        "https://github.com/FhenixProtocol/fhenix-confidential-contracts/blob/0823e57e320c1c72e0caee7faeebc4d3a0710373/contracts/FHERC20/extensions/FHERC20NativeWrapperUpgradeable.sol#L112",
      exampleTxUrl:
        "https://sepolia.etherscan.io/tx/0xd0ce16c80d911ac3d5a9262f79372cff3b87291253e0163ced5c582a3b87e0cf",
      events: DECRYPT_ETH_EVENTS,
    },
    {
      functionSourceUrl:
        "https://github.com/FhenixProtocol/fhenix-confidential-contracts/blob/0823e57e320c1c72e0caee7faeebc4d3a0710373/contracts/FHERC20/extensions/FHERC20NativeWrapperUpgradeable.sol#L135",
      exampleTxUrl:
        "https://sepolia.etherscan.io/tx/0x94b0cd3b3e8c7f53d7b9db497973ffd1b14b2dea3a6ef89f6b5561d775c4b649",
      events: CLAIM_DECRYPTED_ETH_EVENTS,
    },
    {
      functionSourceUrl:
        "https://github.com/FhenixProtocol/fhenix-confidential-contracts/blob/0823e57e320c1c72e0caee7faeebc4d3a0710373/contracts/FHERC20/FHERC20Upgradeable.sol#L216",
      exampleTxUrl:
        "https://sepolia.etherscan.io/tx/0x9e2cc152f3c63cca0c02fcda4e2636776d00a304410b62ffcd110a9f4a664bcb",
      events: ENCRYPTED_TOKEN_TRANSFER_EVENTS,
    },
  ],
} satisfies ProtocolConfig;

export {
  CONFIDENTIAL_ETHER_PROXY,
  ENCRYPT_ETH_EVENTS,
  DECRYPT_ETH_EVENTS,
  CLAIM_DECRYPTED_ETH_EVENTS,
  ENCRYPTED_TOKEN_TRANSFER_EVENTS,
  REDACT_CONFIG,
};
