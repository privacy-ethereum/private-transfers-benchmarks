import type {
  HinkalProtocolStatsFragmentFragment,
  FluidkeyProtocolStatsFragmentFragment,
  PrivacyPoolsProtocolStatsFragmentFragment,
  RailgunProtocolStatsFragmentFragment,
  TornadoCashProtocolStatsFragmentFragment,
} from "../generated/graphql.js";

import { graphql } from "../generated/gql.js";

export type TRootQuery = RailgunProtocolStatsFragmentFragment &
  TornadoCashProtocolStatsFragmentFragment &
  HinkalProtocolStatsFragmentFragment &
  FluidkeyProtocolStatsFragmentFragment &
  PrivacyPoolsProtocolStatsFragmentFragment;

export const RootQuery = graphql(/* GraphQL */ `
  query RootQuery {
    ...RailgunProtocolStatsFragment
    ...TornadoCashProtocolStatsFragment
    ...HinkalProtocolStatsFragment
    ...FluidkeyProtocolStatsFragment
    ...PrivacyPoolsProtocolStatsFragment
  }
`);
