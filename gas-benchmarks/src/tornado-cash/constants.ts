import { parseAbiItem, type Address } from "viem";

/**
 * Tornado Cash Router contract that directs deposits to different pools (ETH, ERC20 0.1, ERC20 1, ERC20 10, ERC20 100):
 * https://github.com/contractscan/etherscan.io-0xd90e2f925da726b50c4ed8d0fb90ad053324f31b/blob/main/TornadoRouter.sol
 */
export const TORNADO_CASH_ROUTER: Address = "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b";

/**
 * TornadoRouter.deposit function:
 * https://github.com/contractscan/etherscan.io-0xd90e2f925da726b50c4ed8d0fb90ad053324f31b/blob/4142a670a8c79b1cd38f67633fe69b83f6f38dad/TornadoRouter.sol#L43
 *
 * Emits:
 * Deposit() - To notify the token public deposit emitted by the pool contract
 * EncryptedNote() - To notify the encrypted note generation emitted by the router contract
 *
 * Example:
 * https://etherscan.io/tx/0x2e847019a164ebff78700fcd1d19b5ade27b78d3869770905e87eed38494b834
 */
export const SHIELD_ETH_EVENTS = [
  parseAbiItem("event Deposit(bytes32 indexed commitment, uint32 leafIndex, uint256 timestamp)"),
  parseAbiItem("event EncryptedNote(address indexed sender, bytes encryptedNote)"),
] as const;

/**
 * Tornado Cash Relayer Registry contract that emits a StakeBurned event when a relayed withdrawal is executed.
 * After it, a pool (ETH, ERC20 0.1, ERC20 1, ERC20 10, ERC20 100) emits a Withdrawal event.
 * https://github.com/contractscan/etherscan.io-0xd90e2f925da726b50c4ed8d0fb90ad053324f31b/blob/main/RelayerRegistry.sol
 */
export const TORNADO_CASH_RELAYER_REGISTRY: Address = "0x58E8dCC13BE9780fC42E8723D8EaD4CF46943dF2";

/**
 * TornadoRegistry.registry function:
 * https://github.com/contractscan/etherscan.io-0xd90e2f925da726b50c4ed8d0fb90ad053324f31b/blob/4142a670a8c79b1cd38f67633fe69b83f6f38dad/RelayerRegistry.sol#L107
 *
 * Emits:
 * StakeBurned() - To notify the stake burning of the withdrawal (emitted by the registry)
 * Withdrawal() - To notify the withdrawal (emitted by the specific pool)
 *
 * Example:
 * https://etherscan.io/tx/0x99e1f27a5d7e8bfcaadad216a6130f66eedeeca43c5d917acd6952414e388331
 */
export const UNSHIELD_ETH_EVENTS = [
  parseAbiItem("event StakeBurned(address relayer, uint256 amountBurned)"),
  parseAbiItem("event Withdrawal(address to, bytes32 nullifierHash, address indexed relayer, uint256 fee)"),
] as const;
