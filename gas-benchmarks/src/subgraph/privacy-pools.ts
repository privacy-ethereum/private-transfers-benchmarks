import { graphql } from "../generated/gql.js";

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
        totalValue

        unshieldTokenStats {
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
