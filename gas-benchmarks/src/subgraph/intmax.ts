import { graphql as graphqlMainnet } from "../generated/mainnet/gql.js";
import { graphql as graphqlScroll } from "../generated/scroll/gql.js";

export const IntmaxMainnetProtocolStatsFragment = graphqlMainnet(/* GraphQL */ `
  fragment IntmaxMainnetProtocolStatsFragment on Query {
    intmaxMainnetProtocolStats(id: "intmax-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      deposit {
        id
        totalCount
        totalGasUsed

        depositStats {
          id
          tokenIndex
          tokenAddress
          totalCount
          totalGasUsed
          totalValue
        }
      }
    }
  }
`);

export const IntmaxScrollProtocolStatsFragment = graphqlScroll(/* GraphQL */ `
  fragment IntmaxScrollProtocolStatsFragment on Query {
    intmaxScrollProtocolStats(id: "intmax-scroll-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      withdrawal {
        id
        totalCount
        totalGasUsed

        withdrawalStats {
          id
          tokenIndex
          totalCount
          totalGasUsed
          totalValue
        }
      }
    }
  }
`);
