import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

import { ETH_RPC_URL } from "./constants.js";

export const publicClient = createPublicClient({
  transport: http(ETH_RPC_URL),
  chain: mainnet,
});
