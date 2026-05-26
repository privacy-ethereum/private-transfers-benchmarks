import { graphql } from "../generated/base/gql.js";

export const VeilCashProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment VeilCashProtocolStatsFragment on Query {
    veilCashProtocolStats(id: "veil-cash-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      depositQueued {
        id
        totalCount
        totalGasUsed
        totalValue
      }

      depositAccepted {
        id
        totalCount
        totalGasUsed
        totalValue
      }

      withdraw {
        id
        totalCount
        totalGasUsed
        totalValue
      }

      transfer {
        id
        totalCount
        totalGasUsed
        totalValue
      }
    }
  }
`);
