import { graphql } from "../generated/gql.js";

export const HinkalProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment HinkalProtocolStatsFragment on Query {
    hinkalProtocolStats(id: "hinkal-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      shieldERC20 {
        id
        totalCount
        totalGasUsed

        shieldERC20TokenStats {
          id
          tokenAddress
          totalCount
          totalGasUsed
          totalValue
        }
      }

      unshieldERC20 {
        id
        totalCount
        totalGasUsed

        unshieldERC20TokenStats {
          id
          tokenAddress
          totalCount
          totalGasUsed
          totalValue
        }
      }

      shieldNative {
        id
        totalCount
        totalGasUsed

        shieldNativeTokenStats {
          id
          totalCount
          totalGasUsed
        }
      }

      unshieldNative {
        id
        totalCount
        totalGasUsed

        unshieldNativeTokenStats {
          id
          totalCount
          totalGasUsed
        }
      }

      transact {
        id
        totalCount
        totalGasUsed

        transactTokenStats {
          id
          totalCount
          totalGasUsed
        }
      }
    }
  }
`);
