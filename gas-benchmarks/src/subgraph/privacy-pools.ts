import { graphql } from "../generated/mainnet/gql.js";

export const PrivacyPoolsProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment PrivacyPoolsProtocolStatsFragment on Query {
    privacyPoolsProtocolStats(id: "privacy-pools-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      shield {
        id
        totalCount
        totalGasUsed
        totalValue

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
        totalValue

        unshieldTokenStats(first: $first) {
          id
          tokenAddress
          totalCount
          totalGasUsed
          totalValue
        }
      }
    }
  }
`);
