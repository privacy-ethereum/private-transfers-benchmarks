import { graphql } from "../generated/arbitrum/gql.js";

export const CurvyProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment CurvyProtocolStatsFragment on Query {
    fluidkeyProtocolStats(id: "curvy-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      stealthToPublic {
        id
        totalCount
        totalGasUsed
      }
    }
  }
`);
