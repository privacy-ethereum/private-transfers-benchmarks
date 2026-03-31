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
  11. Do not reference ZIP/EIP/BIP numbers or processes unless the property is specifically about governance or upgradeability. You may mention that a feature is proposed or in development without naming the specific proposal.
  12. For properties with opt-in privacy (e.g. shielded vs transparent): if the privacy feature exists and is usable, the answer is Yes. Opt-in privacy still counts.

  PROPERTY GUIDANCE RULES:
  13. For compliance properties: consensus-level validation on permissionless blockchains is NOT compliance enforcement. Compliance means active restriction or filtering by an entity.
  14. For cryptographic verifiability: mathematical proofs verify correctness, separate from consensus.
  15. For Open Source: find a page that explicitly states the license type (MIT, Apache 2.0, etc.). Prefer official project websites or license pages over GitHub READMEs. Do not mention repository files (e.g. COPYING, LICENSE), GitHub structure, forks, or derived-from relationships.
  16. For Deposit time / Withdraw time: For L1 protocols without a distinct deposit/withdraw concept, use N/A.
  17. For Escape hatch: For standalone L1 blockchains where funds are native to the chain, this may be N/A.
  18. For Asset privacy: For single-asset protocols (e.g. a chain with only one native currency), use No.
  19. For Censorship resistance: if the protocol is permissionless and any valid transaction can eventually be included (even if individual miners/validators can soft-censor), the answer is Yes. Soft censorship by some participants does not make the protocol censorship-susceptible if others can still include the transaction.

  SOURCE SELECTION RULES:
  20. The page must contain specific technical content about this property — not just a table of contents, navigation page, or landing page.
  21. Do NOT return PDF URLs — they cannot be processed. Find an HTML alternative.
  22. Avoid blog posts as primary sources — they may be outdated. Prefer official docs, specs, or project websites.
  23. If the best source is a PDF, search for an HTML version of the same content.`;

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
