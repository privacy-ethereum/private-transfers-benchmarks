import { graphql } from "../generated/gql.js";

export const FluidkeyProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment FluidkeyProtocolStatsFragment on Query {
    fluidkeyProtocolStats(id: "fluidkey-protocol-stats") {
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
