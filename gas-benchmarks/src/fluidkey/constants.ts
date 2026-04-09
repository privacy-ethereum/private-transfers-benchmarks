import { parseAbiItem, type Address } from "viem";

import type { ProtocolConfig } from "../utils/types.js";

/**
 * USDC ERC20 token contract address used for benchmarking ERC20 shielding and transfers.
 * https://github.com/circlefin/stablecoin-evm/blob/master/contracts/v2/FiatTokenV2_2.sol
 */
const USDC_ERC20_TOKEN_ADDRESS: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

/**
 * Fluidkey relayer send txs to this relayer contract to deploy the Safe contract and execute the transfer to the recipient in a single transaction.
 * There is no open source code for the relayer contract (searched for relayer contracts in Safe and Gelato)
 * https://etherscan.io/address/0x8090a9db6aca56ffa186c75ca0787b18af1058a0
 *
 * A sample implementation of the relayer contract can be found here:
 */
const FLUIDKEY_RELAYER_CONTRACT: Address = "0x8090a9DB6Aca56fFA186C75Ca0787B18af1058a0";

/**
 * A normal ERC20 transfer to any address (including stealth addresses) could be a shield/deposit for Fluidkey
 *
 * Emits:
 * Transfer() - ERC20 token transfer to the stealth address (emitted by the token contract)
 */
const SHIELD_ERC20_EVENTS = [
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
] as const;

/**
 * A "Relay Operation" transaction is executed when the user sends funds from the Fluidkey interface. As stated before, there is no open source code.
 * The transaction deploys the Safe Singleton 1.3.0 contract and sends funds to the public recipient in one bundled transaction.
 *
 * Emits:
 * EnabledModule() - Safe module enabled (emitted by the Safe stealth address)
 * ModuleInitialized() - Safe module initialized (emitted by the Safe)
 * ConfigHashChanged() - Safe config hash changed after module setup (emitted by the Safe)
 * SafeSetup() - Safe setup with 1 owner and threshold 1 (emitted by the Safe stealth address)
 * ProxyCreation() - New Safe proxy deployed at sender's stealth address (emitted by Safe: Proxy Factory 1.3.0)
 * ExecutionSuccess() - Safe stealth transfers fee to relayer (emitted by the Safe stealth address)
 * SafeReceived() - Relayer (Safe stealth address) receives the fee (emitted by the Safe stealth address)
 * ExecutionSuccess() - Safe stealth address executes the transfer to the recipient (emitted by the Safe stealth address)
 * OperationRelayed() - Operation executed successfully (emitted by the relayer contract)
 */
const TRANSFER_ETH_EVENTS = [
  parseAbiItem("event EnabledModule(address module)"),
  parseAbiItem("event ModuleInitialized(address indexed account)"),
  parseAbiItem("event ConfigHashChanged(address indexed account, uint256 oldConfigHash, uint256 newConfigHash)"),
  parseAbiItem(
    "event SafeSetup(address indexed initiator, address[] owners, uint256 threshold, address initializer, address fallbackHandler)",
  ),
  parseAbiItem("event ProxyCreation(address proxy, address singleton)"),
  parseAbiItem("event ExecutionSuccess(bytes32 txHash, uint256 payment)"),
  parseAbiItem("event SafeReceived(address indexed sender, uint256 value)"),
  parseAbiItem("event ExecutionSuccess(bytes32 txHash, uint256 payment)"),
  parseAbiItem("event OperationRelayed(uint256 indexed operationId, bool indexed success)"),
] as const;

/**
 * A "Relay Operation" transaction is executed when the user sends funds from the Fluidkey interface. As stated before, there is no open source code.
 * The transaction deploys the Safe Singleton 1.3.0 contract and sends funds to the public recipient in one bundled transaction.
 *
 * Emits:
 * EnabledModule() - Safe module enabled (emitted by the Safe stealth address)
 * ModuleInitialized() - Safe module initialized (emitted by the Safe)
 * ConfigHashChanged() - Safe config hash changed after module setup (emitted by the Safe)
 * SafeSetup() - Safe setup with 1 owner and threshold 1 (emitted by the Safe stealth address)
 * ProxyCreation() - New Safe proxy deployed at sender's stealth address (emitted by Safe: Proxy Factory 1.3.0)
 * Transfer() - ERC20 transfer to recipient (emitted by the ERC20 token contract)
 * ExecutionSuccess() - Safe stealth transfers fee to relayer (emitted by the Safe stealth address)
 * Transfer() - ERC20 fee transfer to relayer (emitted by the ERC20 token contract)
 * ExecutionSuccess() - Safe stealth address executes the transfer to the recipient (emitted by the Safe stealth address)
 * OperationRelayed() - Operation executed successfully (emitted by the relayer contract)
 */
const TRANSFER_ERC20_EVENTS = [
  parseAbiItem("event EnabledModule(address module)"),
  parseAbiItem("event ModuleInitialized(address indexed account)"),
  parseAbiItem("event ConfigHashChanged(address indexed account, uint256 oldConfigHash, uint256 newConfigHash)"),
  parseAbiItem(
    "event SafeSetup(address indexed initiator, address[] owners, uint256 threshold, address initializer, address fallbackHandler)",
  ),
  parseAbiItem("event ProxyCreation(address proxy, address singleton)"),
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event ExecutionSuccess(bytes32 txHash, uint256 payment)"),
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
  parseAbiItem("event ExecutionSuccess(bytes32 txHash, uint256 payment)"),
  parseAbiItem("event OperationRelayed(uint256 indexed operationId, bool indexed success)"),
] as const;

/** Fluidkey configuration */
const FLUIDKEY_CONFIG = {
  name: "fluidkey",
  version: "1.3.0",
  contracts: [
    {
      address: FLUIDKEY_RELAYER_CONTRACT,
      sourceUrl:
        "https://www.codeslaw.app/contracts/arbitrum/0x7f3319f55ef4a96ae717c5ac27b5adb0435a9280?file=src%2FSmartAccountRelayer.sol",
    },
  ],
  operations: [
    {
      functionSourceUrl:
        "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/9cfdccd35350f7bcc585cf2ede08cd04e7f0ec10/contracts/token/ERC20/IERC20.sol#L16",
      exampleTxUrl: "https://etherscan.io/tx/0xc8a00a361491b878ec68a0f4f452aedc86eea316b0d6e4acee2f53e6719b4fb0",
      events: SHIELD_ERC20_EVENTS,
    },
    {
      functionSourceUrl:
        "https://www.codeslaw.app/contracts/arbitrum/0x7f3319f55ef4a96ae717c5ac27b5adb0435a9280?file=src%2FSmartAccountRelayer.sol&start=30",
      exampleTxUrl: "https://etherscan.io/tx/0x8a63395db9779ab66661653be4ffe2a15bd5df345d9389ec12f7bd44bb07f7d4",
      events: TRANSFER_ETH_EVENTS,
    },
    {
      functionSourceUrl:
        "https://www.codeslaw.app/contracts/arbitrum/0x7f3319f55ef4a96ae717c5ac27b5adb0435a9280?file=src%2FSmartAccountRelayer.sol&start=30",
      exampleTxUrl: "https://etherscan.io/tx/0xf10db1f5474b8ef4592fa95abef49e73f53f5c2773297dade0d8e209176f7aec",
      events: TRANSFER_ERC20_EVENTS,
    },
  ],
} satisfies ProtocolConfig;

export {
  USDC_ERC20_TOKEN_ADDRESS,
  FLUIDKEY_RELAYER_CONTRACT,
  SHIELD_ERC20_EVENTS,
  TRANSFER_ETH_EVENTS,
  TRANSFER_ERC20_EVENTS,
  FLUIDKEY_CONFIG,
};
