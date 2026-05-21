import type {
  HinkalProtocolStatsFragmentFragment,
  FluidkeyProtocolStatsFragmentFragment,
  PrivacyPoolsProtocolStatsFragmentFragment,
  RailgunProtocolStatsFragmentFragment,
  TornadoCashProtocolStatsFragmentFragment,
} from "../generated/mainnet/graphql.js";

import { graphql } from "../generated/mainnet/gql.js";

export type TMainnetRootQuery = RailgunProtocolStatsFragmentFragment &
  TornadoCashProtocolStatsFragmentFragment &
  HinkalProtocolStatsFragmentFragment &
  FluidkeyProtocolStatsFragmentFragment &
  PrivacyPoolsProtocolStatsFragmentFragment;

export const MainnetRootQuery = graphql(/* GraphQL */ `
  query MainnetRootQuery {
    ...RailgunProtocolStatsFragment
    ...TornadoCashProtocolStatsFragment
    ...HinkalProtocolStatsFragment
    ...FluidkeyProtocolStatsFragment
    ...PrivacyPoolsProtocolStatsFragment
  }
`);
