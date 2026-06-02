import type {
  BlankSquareProtocolStatsFragmentFragment,
  VeilCashProtocolStatsFragmentFragment,
} from "../generated/base/graphql.js";

import { graphql } from "../generated/base/gql.js";

export type TBaseRootQuery = BlankSquareProtocolStatsFragmentFragment & VeilCashProtocolStatsFragmentFragment;

export const BaseRootQuery = graphql(/* GraphQL */ `
  query BaseRootQuery {
    ...BlankSquareProtocolStatsFragment
    ...VeilCashProtocolStatsFragment
  }
`);
