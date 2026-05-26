import { graphql } from "../generated/mainnet/gql.js";

export const Zerc20ProtocolStatsFragment = graphql(/* GraphQL */ `
  fragment Zerc20ProtocolStatsFragment on Query {
    zerc20ProtocolStats(id: "zerc20-protocol-stats") {
      id
      totalTxCount
      totalGasUsed

      wrap {
        id
        totalCount
        totalGasUsed
        totalValue

        wrappedStats {
          id
          tokenAddress
          totalCount
          totalGasUsed
          totalValue
        }
      }

      unwrap {
        id
        totalCount
        totalGasUsed
        totalValue

        unwrappedStats {
          id
          tokenAddress
          totalCount
          totalGasUsed
          totalValue
        }
      }

      teleport {
        id
        totalCount
        totalGasUsed
        totalValue

        teleportedStats {
          id
          tokenAddress
          totalCount
          totalGasUsed
          totalValue
        }
      }
    }
  }
`);
