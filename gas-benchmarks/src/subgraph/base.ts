import type { BlankSquareProtocolStatsFragmentFragment } from "../generated/base/graphql.js";

import { graphql } from "../generated/base/gql.js";

export type TBaseRootQuery = BlankSquareProtocolStatsFragmentFragment;

export const BaseRootQuery = graphql(/* GraphQL */ `
  query BaseRootQuery {
    ...BlankSquareProtocolStatsFragment
  }
`);
