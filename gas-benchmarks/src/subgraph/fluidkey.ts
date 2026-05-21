import { graphql } from "../generated/mainnet/gql.js";

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
