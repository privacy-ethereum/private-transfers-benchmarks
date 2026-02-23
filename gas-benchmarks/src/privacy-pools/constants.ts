import { parseAbiItem, type Address } from "viem";

/**
 * Proxy contract address for the Privacy Pools Entrypoint:
 * https://github.com/0xbow-io/privacy-pools-core/blob/main/packages/contracts/src/contracts/Entrypoint.sol
 */
export const PRIVACY_POOLS_ENTRYPOINT_PROXY: Address = "0x6818809EefCe719E480a7526D76bD3e561526b46";

/**
 * Entrypoint.deposit function:
 * https://github.com/0xbow-io/privacy-pools-core/blob/7bc392dad5fa483f53cf74e25d7ad19f0fc6d85f/packages/contracts/src/contracts/Entrypoint.sol#L111
 *
 * Emits:
 * LeafInserted() - To notify the leaf insertion in the merkle tree
 * Deposited() - Emitted inside PrivacyPool.sol contract (internal)
 * Deposited() - Emitted inside Entrypoint.sol contract (external)
 *
 * Example:
 * https://etherscan.io/tx/0x87320aaae4868c6f5b7c8b31ba2fc82005bdd7522fdf85f9eb8dcc93a34cb475
 */
export const SHIELD_ETH_EVENTS = [
  parseAbiItem("event LeafInserted(uint256 _index, uint256 _leaf, uint256 _root)"),
  parseAbiItem(
    "event Deposited(address indexed _depositor, uint256 _commitment, uint256 _label, uint256 _value, uint256 _precommitmentHash)",
  ),
  parseAbiItem("event Deposited(address indexed depositor, address indexed pool, uint256 commitment, uint256 amount)"),
] as const;

/**
 * Entrypoint.relay function:
 * https://github.com/0xbow-io/privacy-pools-core/blob/7bc392dad5fa483f53cf74e25d7ad19f0fc6d85f/packages/contracts/src/contracts/Entrypoint.sol#L133
 *
 * Emits:
 * LeafInserted() - Emitted inside State.sol -> insert()
 * Withdrawn() - Emitted inside PrivacyPool.sol -> withdraw()
 * WithdrawalRelayed() - Emitted inside Entrypoint.relay()
 *
 * Example:
 * https://etherscan.io/tx/0x47e918eda32bc332a5684aa986733eb4fde7a4f8189e21443f23adf0807974b7
 */
export const UNSHIELD_ETH_EVENTS = [
  parseAbiItem("event LeafInserted(uint256 _index, uint256 _leaf, uint256 _root)"),
  parseAbiItem(
    "event Withdrawn(address indexed processor, uint256 value, uint256 spentNullifier, uint256 newCommitment)",
  ),
  parseAbiItem(
    "event WithdrawalRelayed(address indexed relayer, address indexed recipient, address indexed asset, uint256 amount, uint256 feeAmount)",
  ),
] as const;
