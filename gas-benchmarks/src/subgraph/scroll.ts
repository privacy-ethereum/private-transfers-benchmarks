import type { IntmaxScrollProtocolStatsFragmentFragment } from "../generated/scroll/graphql.js";

import { graphql } from "../generated/scroll/gql.js";

export type TScrollRootQuery = IntmaxScrollProtocolStatsFragmentFragment;

export const ScrollRootQuery = graphql(/* GraphQL */ `
  query ScrollRootQuery {
    ...IntmaxScrollProtocolStatsFragment
  }
`);
