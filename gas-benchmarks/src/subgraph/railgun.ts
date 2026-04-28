import { graphql } from "../generated/gql.js";

export const RailgunProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment RailgunProtocolStatsFragment on Query {
    railgunProtocolStats(id: "railgun-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      shield {
        id
        totalCount
        totalGasUsed

        shieldTokenStats {
          id
          tokenAddress
          totalCount
          totalGasUsed
          totalValue
        }
      }

      unshield {
        id
        totalCount
        totalGasUsed

        unshieldTokenStats {
          id
          tokenAddress
          totalCount
          totalGasUsed
          totalValue
        }
      }

      transact {
        id
        totalCount
        totalGasUsed
      }
    }
  }
`);
