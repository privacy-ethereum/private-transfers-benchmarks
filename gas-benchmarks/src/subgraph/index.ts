import type {
  HinkalProtocolStatsFragmentFragment,
  PrivacyPoolsProtocolStatsFragmentFragment,
  RailgunProtocolStatsFragmentFragment,
  TornadoCashProtocolStatsFragmentFragment,
} from "../generated/graphql.js";

import { graphql } from "../generated/gql.js";

export type TRootQuery = RailgunProtocolStatsFragmentFragment &
  TornadoCashProtocolStatsFragmentFragment &
  HinkalProtocolStatsFragmentFragment &
  PrivacyPoolsProtocolStatsFragmentFragment;

export const RootQuery = graphql(/* GraphQL */ `
  query RootQuery {
    ...RailgunProtocolStatsFragment
    ...TornadoCashProtocolStatsFragment
    ...HinkalProtocolStatsFragment
    ...PrivacyPoolsProtocolStatsFragment
  }
`);
