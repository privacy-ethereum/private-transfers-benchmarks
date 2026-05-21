import { graphql } from "../generated/sepolia/gql.js";

export const RedactProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment RedactProtocolStatsFragment on Query {
    redactProtocolStats(id: "redact-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      shieldedNative {
        id
        totalCount
        totalGasUsed

        shieldedNativeStats {
          id
          totalCount
          totalGasUsed
          totalValue
        }
      }

      unshielded {
        id
        totalCount
        totalGasUsed

        unshieldedStats {
          id
          totalCount
          totalGasUsed
          totalValue
        }
      }
    }
  }
`);
