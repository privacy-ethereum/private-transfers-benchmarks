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
      }

      depositAccepted {
        id
        totalCount
        totalGasUsed
      }

      withdraw {
        id
        totalCount
        totalGasUsed
      }

      transfer {
        id
        totalCount
        totalGasUsed
      }
    }
  }
`);
