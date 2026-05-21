import type { RedactProtocolStatsFragmentFragment } from "../generated/sepolia/graphql.js";

import { graphql } from "../generated/sepolia/gql.js";

export type TSepoliaRootQuery = RedactProtocolStatsFragmentFragment;

export const SepoliaRootQuery = graphql(/* GraphQL */ `
  query SepoliaRootQuery {
    ...RedactProtocolStatsFragment
  }
`);
