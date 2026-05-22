# Contributing

🎉 Thank you for being interested in contributing to this repository! 🎉

Feel welcome and read the following sections in order to know how to ask questions and how to work on something.

All members of our community are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please make sure you are welcoming and friendly in all of our spaces.

Disclaimer: We do not accept minor grammatical fixes (e.g., correcting typos, rewording sentences) unless they significantly improve clarity in technical documentation. These contributions, while appreciated, are not a priority for merging.

## How You Can Contribute

This repository contains three main components: project-evaluations which contains evlaution data and a public dashboard; protocol benchmarks to record specific benchmark metrics; subgraph where we retrieve the onchain data required for the benchmarks.

You can contribute an evaluation or a benchmark. If you spot any mistakes with the evaluations, you can also raise an issue for someone to look into, or fix it yourself. Please check our citation requirements for evaluations below.

### Contribution options TLDR

1. Spot an issue with our evaluations and raise an issue or PR to fix it
2. Pick a protocol to evaluate and submit a PR
3. Pick a protocol to benchmark and submit a PR

### 1. Fix or highlight and issue with an evalution

If you spot an issue

### 2. Submit a protocol evaluation

The protocol evaluations are located in the `project-evaluations` directory. If you are interested in contributing a protocol evaluation, you can follow these steps:

We have many pending projects that you can pick up, check no one else is assigned to the issue if you're picking up an existing issue. See [pending project issues here](https://github.com/privacy-ethereum/private-transfers-benchmarks/issues/35)

1. Follow the instructions in the [README](project-evaluations/README.md) to set up the project and run the dashboard locally.

2. Read the properties definitions and the existing evaluations to understand how to evaluate a protocol.

3. Start evaluating a protocol of your choice and add the content in `project-evaluations/src/data/evaluations/<PROTOCOL_NAME>.json`.

4. Please make sure to review your evaluation and check it is consistent across the different properties. If you used an AI tool to help you, make sure there is a human review of the content before submitting the PR. AI results are human responsibility, and we want to make sure the content we publish is accurate and of high quality.

## Citation quality

Every property value must be backed by a source.

Prefer official docs, source code, or audits over blog posts or social media. One strong source beats several weak ones.

AI tools may help you draft citations, but a human must verify every quote actually appears in the source and supports the value — AI output is the contributor's responsibility.

Two formats are accepted:

### 1. Citation:

`cited_text` is the exact sentence or figure from the source that supports your value. This lets reviewers verify the claim without re-reading the whole page. You can copy and paste the cited text value.

```json
{
  "name": "Confidentiality",
  "value": "Yes",
  "notes": "Zcash provides full confidentiality for shielded addresses...",
  "citations": [
    {
      "cited_text": "Therefore, there are four basic types of transactions: Shielded/private (Value is not revealed on the blockchain)",
      "source": "https://zcash.readthedocs.io/en/latest/rtd_pages/addresses.html"
    }
  ]
}
```

### 2. URL:

A single `url` linking to the page that backs the value.

```json
{
   "name": "Confidentiality",
   "value": "No",
   "notes": "Privacy Pools uses the same the note-based architecture as Tornado Cash. Deposit and withdrawal amounts are publicly visible on-chain. The protocol provides unlinkability between deposit and withdrawal addresses, not amount or balance confidentiality.",
   "url": "https://docs.privacypools.com/protocol/deposit"
},
```

### 3. Submit a protocol benchmark

The protocol benchmarks scripts are located in the `gas-benchmarks` directory but the data gathering logic is defined in the `subgraph` directory. If you are interested in contributing a protocol benchmark, you can follow these steps:

1. Follow the instructions in the [README](gas-benchmarks/README.md) to set up the project and run the benchmarks locally.

2. In order to efficiently gather historical event data for the benchmarks we used a subgraph from [The Graph](https://thegraph.com/docs/en/subgraphs/quick-start/). All logic is located in `subgraph` directory. So if you want to contribute a protocol benchmark you need to:
   1. add the protocol contract address and target events in `subgraph/configuration/subgraph.<NETWORK_NAME>.yaml`
   2. add a new schema in `subgraph/schemas`
   3. add a README.md file in `subgraph/src/<PROTOCOL_NAME>/README.md` describing the protocol and the benchmark you are implementing, to make it easier for future contributors to understand the logic.
   4. add an event handler function in `subgraph/src/<PROTOCOL_NAME>/<CONTRACT_NAME>.ts`. The schema defines the data structure that will be saved and the event handler function defines how to process an event and save its corresponding data.
   5. Add unit tests in `subgraph/tests/<PROTOCOL_NAME>/<CONTRACT_NAME>.test.ts` to make sure the event handler function works as expected.

3. Please make sure to review your code. If you used an AI tool to help you, make sure there is a human review of the content before submitting the PR. AI results are human responsibility, and we want to make sure the content we publish is accurate and of high quality.
