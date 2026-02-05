import { defineConfig } from "hardhat/config";
import hardhatToolboxMocheEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";


export default defineConfig({
    solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      forking: {
        url: process.env.SEPOLIA_RPC_URL || "https://sepolia.gateway.tenderly.co",
      },
      gas: 30000000, // Large gas limit for privacy protocol operations
      blockGasLimit: 30000000,
    },
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.gateway.tenderly.co",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  plugins: [hardhatToolboxMocheEthers]
});
