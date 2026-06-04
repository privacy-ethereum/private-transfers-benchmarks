import { graphql } from "../generated/mainnet/gql.js";

export const WormProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment WormProtocolStatsFragment on Query {
    wormProtocolStats(id: "worm-protocol-stats") {
      id
      totalTxCount

      withdraw {
        id
        totalCount
      }
    }
  }
`);
