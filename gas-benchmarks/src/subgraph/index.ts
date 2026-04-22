import type { RailgunProtocolStatsFragmentFragment } from "../generated/graphql.js";

import { graphql } from "../generated/gql.js";

export type TRootQuery = RailgunProtocolStatsFragmentFragment;

export const RootQuery = graphql(/* GraphQL */ `
  query RootQuery {
    ...RailgunProtocolStatsFragment
  }
`);
