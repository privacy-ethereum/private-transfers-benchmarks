import { graphql } from "../generated/base/gql.js";

export const BlankSquareProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment BlankSquareProtocolStatsFragment on Query {
    blanksquareProtocolStats(id: "blanksquare-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      deposit {
        id
        totalCount
        totalGasUsed
        totalValue

        depositStats {
          id
          totalCount
          totalGasUsed
          totalValue
        }
      }

      withdraw {
        id
        totalCount
        totalGasUsed
        totalValue

        withdrawStats {
          id
          totalCount
          totalGasUsed
          totalValue
        }
      }
    }
  }
`);
