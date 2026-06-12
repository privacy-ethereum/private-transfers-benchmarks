import { graphql } from "../generated/mainnet/gql.js";

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

        shieldTokenStats(first: $first) {
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

        unshieldTokenStats(first: $first) {
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
