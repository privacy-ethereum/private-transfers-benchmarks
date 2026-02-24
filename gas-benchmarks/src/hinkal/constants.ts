import { parseAbiItem, type Address } from "viem";

/**
 * Hinkal Pool contract deployed at the same address across all supported chains
 * (Ethereum, Arbitrum, Optimism, Polygon, Base):
 * https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/main/contracts/Hinkal.sol
 */
export const HINKAL_POOL: Address = "0x25e5e82f5702A27C3466fE68f14abDbbAdFca826";

/**
 * Hinkal.prooflessDeposit function - shield ERC20 tokens into the Hinkal pool without a ZK proof:
 * https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/main/contracts/Hinkal.sol
 *
 * Emits:
 * Transfer() - ERC20 token transfer from depositor to Hinkal pool (emitted by the ERC20 token contract)
 * NewCommitment() - New private commitment inserted into the Merkle tree (emitted by HinkalBase.insertCommitments)
 *
 * Example:
 * https://etherscan.io/tx/0x49c3aa537160afdb4392a498c14bd4f1e2b7de2554004dbdbd8c8669e81a94e0
 */
export const SHIELD_ERC20_EVENTS = [
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event NewCommitment(uint256 commitment, int256 index, bytes encryptedOutput)"),
] as const;

/**
 * Hinkal.transact function (unshield) - withdraw ERC20 tokens from the Hinkal pool:
 * https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/main/contracts/Hinkal.sol
 *
 * Emits:
 * Transfer() - ERC20 token transfer from Hinkal pool to recipient (emitted by the ERC20 token contract)
 * Nullified() - Input commitment nullifier marked as spent (emitted by HinkalBase.insertNullifiers)
 *
 * Example:
 * https://etherscan.io/tx/0x125714bb4db48757007fff2671b37637bbfd6d47b3a4757ebbd0c5222984f905
 */
export const UNSHIELD_ERC20_EVENTS = [
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event Nullified(uint256 nullifier)"),
] as const;

/**
 * Hinkal.transact function (private transfer) - move ERC20 tokens privately within the Hinkal pool:
 * https://github.com/Hinkal-Protocol/Hinkal-Smart-Contracts/blob/main/contracts/Hinkal.sol
 *
 * Emits:
 * Nullified() - Input commitment nullifier marked as spent (emitted by HinkalBase.insertNullifiers)
 * NewCommitment() - Recipient output commitment inserted into Merkle tree (emitted by HinkalBase.insertCommitments)
 * NewCommitment() - Sender change commitment inserted into Merkle tree (emitted by HinkalBase.insertCommitments)
 *
 * Example:
 * https://polygonscan.com/tx/0xeb3f7fb464a4904cda019c47cc92e0813b9e1395a0fba0de0bf45b851163b088
 */
export const TRANSFER_ERC20_EVENTS = [
  parseAbiItem("event Nullified(uint256 nullifier)"),
  parseAbiItem("event NewCommitment(uint256 commitment, int256 index, bytes encryptedOutput)"),
  parseAbiItem("event NewCommitment(uint256 commitment, int256 index, bytes encryptedOutput)"),
] as const;
