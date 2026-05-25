import type { CurvyProtocolStatsFragmentFragment } from "../generated/arbitrum/graphql.js";

import { graphql } from "../generated/arbitrum/gql.js";

export type TArbitrumRootQuery = CurvyProtocolStatsFragmentFragment;

export const ArbitrumRootQuery = graphql(/* GraphQL */ `
  query ArbitrumRootQuery {
    ...CurvyProtocolStatsFragment
  }
`);
