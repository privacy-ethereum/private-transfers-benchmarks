import type { PropertyContent } from "../src/types.js";

// prettier-ignore
const BASE_PROMPT = (
  property: PropertyContent,
  protocolName: string,
) => `You are a technical researcher evaluating privacy protocols for an objective report
  called "The State of Private Transfers 2026". The report is a comprehensive analysis of the state of
  private transfers, including the current landscape, the challenges and opportunities, and the future
  of private transfers.

  Evaluate the "${property.name}" property for ${protocolName}.

  Property definition: ${property.description}
  Metric: ${property.metric}
  Input type: ${property.inputType}

  ${property.options ? `Allowed values: ${property.options.join(" / ")}` : `Expected format: ${property.metric}`}`;

// prettier-ignore
const BASE_RULES = `
  GENERAL RULES:
  1. Start your answer by directly addressing the property. Your first sentence must answer the question.
  2. Every sentence must be relevant to the property being evaluated. Do not include general descriptions of the protocol, its history, or features unrelated to this specific property.
  3. Prioritize information density. Every sentence should deliver a concrete fact.
  4. Only state facts you are highly confident about.
  5. If uncertain about a claim, omit it rather than guess. Never invent statistics, percentages, or quotes.
  6. Distinguish current live features from planned/future ones. Future features must NOT influence the value chosen.
  7. Never use these phrases: "the document", "prior research", "the provided documentation", "indicates", "confirms", "the prior research confirms", "the prior research found". Write as if you are the expert, not reading a source.
  8. Never say "since X, the answer is Y". Just state the answer and explain why.
  9. Write technically but naturally — not robotic. Avoid marketing language (e.g. "banks", "your money", "advanced applied cryptography", "enhanced privacy", "cutting-edge", "innovative", "first practical application of").
  10. Do not reference PRs, config files, variable names, lines of code, or implementation details. Focus on protocol-level facts. You CAN reference technical standards and primitives (e.g. BIP32, BFT, zk-SNARKs, viewing keys, nullifier sets, commitment trees) — aim for a technical assessment, not a code review.
  11. Do not reference ZIP/EIP/BIP numbers, improvement proposal processes, or governance token mechanics unless the property is specifically about governance or upgradeability. You may mention that a feature is proposed or in development without naming the specific proposal.
  12. For properties with opt-in privacy (e.g. shielded vs transparent): if the privacy feature exists and is usable, the answer is Yes. Opt-in privacy still counts.
  13. Only cite text that directly proves or disproves the specific property being evaluated. Do not cite general protocol descriptions, feature overviews, or related but tangential information.

  PROPERTY GUIDANCE RULES:
  14. For compliance properties: consensus-level validation on permissionless blockchains is NOT compliance enforcement. Compliance means active restriction or filtering by an entity.
  15. For cryptographic verifiability: mathematical proofs verify correctness, separate from consensus.
  16. For Open Source: find a page that explicitly states the license type (MIT, Apache 2.0, etc.). Prefer official project websites or license pages over GitHub READMEs. Do not mention repository files (e.g. COPYING, LICENSE), GitHub structure, forks, or derived-from relationships.
  17. For Deposit time / Withdraw time: For L1 protocols without a distinct deposit/withdraw concept, use N/A.
  18. For Escape hatch: For standalone L1 blockchains where funds are native to the chain, this may be N/A.
  19. For Asset privacy: For single-asset protocols (e.g. a chain with only one native currency), use No.
  20. For Censorship resistance: if the protocol is permissionless and any valid transaction can eventually be included (even if individual miners/validators can soft-censor), the answer is Yes. Soft censorship by some participants does not make the protocol censorship-susceptible if others can still include the transaction. If the protocol uses relayers or broadcasters, mention their role in the description. Relayer dependence alone does not make the protocol censorship-susceptible if users can bypass relayers and interact with the underlying contracts directly.

  SOURCE SELECTION RULES:
  21. The page must contain specific technical content about this property — not just a table of contents, navigation page, or landing page.
  22. Do NOT return PDF URLs — they cannot be processed. Find an HTML alternative.
  23. Never use blog posts from exchanges, trading platforms, or non-official sources. Only use blog posts from the protocol's own team or foundation (e.g. electriccoin.co/blog for Zcash, blog.ethereum.org for Ethereum). Prefer official docs, specs, or project websites over any blog.
  24. If the best source is a PDF, search for an HTML version of the same content.

  ADDITIONAL PROPERTY RULES:
  25. For Number of secrets: the value should count only independently stored secrets. If all keys (spending, viewing, encryption) are deterministically derived from one wallet signature or mnemonic, the answer is 1. The notes MUST list all keys the protocol uses, how each is derived, and what cryptographic primitives are used (curves, hash functions, key derivation schemes).
  26. For Time-to-finality (apps/L2s/L3s): should be N/A if the protocol is deployed on other blockchains and inherits their finality. List all deployed networks. Exception: L3s may have their own finality time if their settlement adds delay beyond the underlying L2.
  27. For Cryptographic verifiability (L1s): transaction correctness can be cryptographically verified (zk-SNARKs, ring signatures, etc.) while consensus uses PoW/PoS (majority-based). Note this distinction. For protocols with additional trust assumptions (upgradable contracts, permissioned gates), the answer may be No even if the proof system is sound.
  28. For Open source: must state the specific license (MIT, BSD 3-Clause, GPL-3.0, Unlicense, etc.). Check ALL key repositories — contracts, circuits, SDKs may have different licenses. If any critical component (e.g. ZK circuits) has no license or is "source-available" only, the answer is No.
  29. For Plausible deniability: this property asks whether private transfers are indistinguishable from public transfers. For privacy-by-default protocols (e.g. Monero), the answer is No because the entire protocol is a known privacy chain — a user cannot plausibly deny to an exchange or regulator that privacy features are being used. Plausible deniability requires private transactions to be embedded within or indistinguishable from non-private ones (e.g. zkWormholes). For opt-in privacy protocols, plausible deniability is also No because shielded transactions are distinguishable from transparent ones.
  30. For Relayers/Broadcasters: if a protocol uses relayers, mention this in Censorship resistance notes but do not change the value to No if users can interact with contracts directly. Mention in External network dependence but mark as No if the relayer is optional.
  31. Do not use library names in notes (e.g. "plonky2_bn254", "plonky2_keccak"). Use cryptographic primitive names instead (e.g. "BN254 curve", "Keccak hashing").
  32. Do not restate the value as a conclusion at the end of notes (e.g. "Therefore the answer is Yes" or "Therefore there are 2 secrets").`;

// prettier-ignore
export function buildResearchPrompt(
  property: PropertyContent,
  protocolName: string,
  sourceUrls?: string[],
  triedUrls: string[] = [],
): string {
  return `
    ${BASE_PROMPT(property, protocolName)}

    Hint: ${sourceUrls?.length
      ? "Suggested starting points for research:\n" + sourceUrls.map((u) => `- ${u}`).join("\n")
      : "The latest documentation is a good place to start, but you should expand your search beyond this"}

    ${triedUrls.length > 0
      ? "Do NOT use these URLs (already tried means there is insufficient content):\n" + triedUrls.map((u) => `- ${u}`).join("\n")
      : ""}

    ${BASE_RULES}

    Search the web for the most authoritative source page for this property.
    Respond with ONLY a JSON object: {"url": "best_source_url", "summary": "what you found"}`;
}

// prettier-ignore
export function buildEvaluationPrompt(
  property: PropertyContent,
  protocolName: string,
  researchSummary: string,
): string {
  return `
    ${BASE_PROMPT(property, protocolName)}

    Prior research found: ${researchSummary}

    ${BASE_RULES}

    Then output a JSON object (no code fences):
    - "value": matching one of the allowed options exactly
    - "notes": your 2-4 sentence answer from above

    IMPORTANT: If the input type is "multi-select", you MUST format the value as a JSON array string even for a single selection, e.g. ["Option1"]. Never output a plain string for multi-select fields.
    If the property is a number or text, provide the value as a string.`;
}
