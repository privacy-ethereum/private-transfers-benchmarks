import { GraphQLClient } from "graphql-request";

import type {
  FluidkeyProtocolStatsFragmentFragment,
  RailgunProtocolStatsFragmentFragment,
  TornadoCashProtocolStatsFragmentFragment,
} from "../generated/graphql.js";

import { graphql } from "../generated/gql.js";
import { SUBGRAPH_URL } from "../utils/constants.js";

export type TRootQuery = RailgunProtocolStatsFragmentFragment &
  TornadoCashProtocolStatsFragmentFragment &
  FluidkeyProtocolStatsFragmentFragment;

export const RootQuery = graphql(/* GraphQL */ `
  query RootQuery {
    ...RailgunProtocolStatsFragment
    ...TornadoCashProtocolStatsFragment
    ...FluidkeyProtocolStatsFragment
  }
`);

class Subgraph {
  results: TRootQuery | null = null;

  async getResults() {
    if (this.results === null) {
      const client = new GraphQLClient(SUBGRAPH_URL);

      this.results = await client.request<TRootQuery>(RootQuery);
    }

    return this.results;
  }
}

export const subgraph = new Subgraph();
