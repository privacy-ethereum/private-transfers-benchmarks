import type {
  HinkalProtocolStatsFragmentFragment,
  FluidkeyProtocolStatsFragmentFragment,
  PrivacyPoolsProtocolStatsFragmentFragment,
  RailgunProtocolStatsFragmentFragment,
  TornadoCashProtocolStatsFragmentFragment,
  WormProtocolStatsFragmentFragment,
  Zerc20ProtocolStatsFragmentFragment,
} from "../generated/mainnet/graphql.js";

import { graphql } from "../generated/mainnet/gql.js";

export type TMainnetRootQuery = RailgunProtocolStatsFragmentFragment &
  TornadoCashProtocolStatsFragmentFragment &
  HinkalProtocolStatsFragmentFragment &
  FluidkeyProtocolStatsFragmentFragment &
  PrivacyPoolsProtocolStatsFragmentFragment &
  WormProtocolStatsFragmentFragment &
  Zerc20ProtocolStatsFragmentFragment;

export const MainnetRootQuery = graphql(/* GraphQL */ `
  query MainnetRootQuery {
    ...RailgunProtocolStatsFragment
    ...TornadoCashProtocolStatsFragment
    ...HinkalProtocolStatsFragment
    ...FluidkeyProtocolStatsFragment
    ...PrivacyPoolsProtocolStatsFragment
    ...WormProtocolStatsFragment
    ...Zerc20ProtocolStatsFragment
  }
`);
