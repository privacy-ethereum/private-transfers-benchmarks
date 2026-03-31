if (!process.env.MONERO_FAIL_NODES_API_URL) {
  throw new Error("MONERO_FAIL_NODES_API_URL is not set");
}

/**
 * monero.fail API to fetch available Monero nodes for RPC calls.
 * @see https://monero.fail/
 * @see https://docs.getmonero.org/rpc-library/monerod-rpc/#introduction
 */
export const { MONERO_FAIL_NODES_API_URL } = process.env;

/**
 * Maximum number of transaction hashes per batch
 * */
export const MAX_TXS_PER_BATCH = 50;

/**
 * Number of decimals for XMR to convert from atomic units to whole units
 * Reference: https://docs.getmonero.org/technical-specs/#divisibility
 */
export const XMR_DECIMALS = 12;
