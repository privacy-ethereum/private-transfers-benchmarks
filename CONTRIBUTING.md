# Contributing

🎉 Thank you for being interested in contributing to MACI! 🎉

Feel welcome and read the following sections in order to know how to ask questions and how to work on something.

All members of our community are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please make sure you are welcoming and friendly in all of our spaces.

We're really glad you're reading this, because we need volunteer developers to help this project come to fruition. There is a lot we want to achieve, and this can only be made possible thanks to your support. 👏

Disclaimer: We do not accept minor grammatical fixes (e.g., correcting typos, rewording sentences) unless they significantly improve clarity in technical documentation. These contributions, while appreciated, are not a priority for merging.

## How You Can Contribute

This repository contains two main components: protocol evaluations to show in a public dashboard and protocol benchmarks to measure specific metrics of the evaluations. Please aim for your contribution to contain both an evaluation and a benchmark, to keep growing the repository in a balanced way. You can split your contribution into 2 PRs in order to make it easier to review, but please make sure to link the two PRs together in the description.

### TLDR

1. Pick a protocol to evaluat and benchmark. We need both
2. Submit PR for protocol evaluation
3. Submit PR for protocol benchmark

### Submit a protocol evaluation

The protocol evaluations are located in the `project-evaluations` directory. If you are interested in contributing a protocol evaluation, you can follow these steps:

1. Follow the instructions in the [README](project-evaluations/README.md) to set up the project and run the dashboard locally.

2. Read the properties definitions and the existing evaluations to understand how to evaluate a protocol.

3. Start evaluating a protocol of your choice and add the content in `project-evaluations/src/data/evaluations/<PROTOCOL_NAME>.json`.

4. Modify the `project-evaluations/src/data/evaluations/index.ts` file to add the protocol you evaluated. After doing so, the protocol show be visible in the local running dashboard.

5. Please make sure to review your evaluation and check it is consistent accross the different properties. If you used an AI tool to help you, make sure there is a human review of the content before submitting the PR. AI results are human responbility, and we want to make sure the content we publish is accurate and of high quality.

### Submit a protocol benchmark

The protocol benchmarks scripts are located in the `gas-benchmarks` directory but the data gathering logic is defined in the `subgraph` directory. If you are interested in contributing a protocol benchmark, you can follow these steps:

1. Follow the instructions in the [README](gas-benchmarks/README.md) to set up the project and run the benchmarks locally.

2. In order to efficiently gather historical event data for the benchmarks we used a subgraph from [The Graph](https://thegraph.com/docs/en/subgraphs/quick-start/). All logic is located in `subgraph` directory. So if you want to contribute a protocol benchmark you need to:
   1. add the protocol contract address and target events in `subgraph/configuration/subgraph.<NETWORK_NAME>.yaml`
   2. add a new schema in `subgraph/schemas`
   3. add a README.md file in `subgraph/src/<PROTOCOL_NAME>/README.md` describing the protocol and the benchmark you are implementing, to make it easier for future contributors to understand the logic.
   4. add an event handler function in `subgraph/src/<PROTOCOL_NAME>/<CONTRACT_NAME>.ts`. The schema defines the data structure that will be saved and the event handler function defines how to process an event and save its corresponding data.
   5. Add unit tests in `subgraph/tests/<PROTOCOL_NAME>/<CONTRACT_NAME>.test.ts` to make sure the event handler function works as expected.

3. Please make sure to review your benchmarks and check the results are consistent with the on-chain data. If you used an AI tool to help you, make sure there is a human review of the content before submitting the PR. AI results are human responbility, and we want to make sure the content we publish is accurate and of high quality.
