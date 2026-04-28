import { graphql } from "../generated/gql.js";

export const TornadoCashProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment TornadoCashProtocolStatsFragment on Query {
    tornadoCashProtocolStats(id: "tornado-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      shield {
        id
        totalCount
        totalGasUsed
        totalValue
      }

      unshield {
        id
        totalCount
        totalGasUsed
        totalValue
      }
    }
  }
`);
