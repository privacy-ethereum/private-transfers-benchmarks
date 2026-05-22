import { existsSync, readFileSync } from "fs";
import type { PropertyContent } from "../src/types.js";
import { PROPERTY_DEFINITIONS } from "../src/data/schema.js";

/**
 * Single source of truth for evaluation rules.
 *
 * Rules are grouped by the flow that consumes them. Anything written or reviewed
 * goes through this file.
 *
 *   WRITING_RULES          — used by the citations prompt and by the review skill.
 *   CROSS_CHECK_RULES      — consistency checks; used by the citations prompt and by review.
 *   VALUE_FORMAT_RULES     — schema enum + JSON shape; used by the citations prompt and by review.
 *   SOURCE_SELECTION_RULES — used by the /research-sources skill when discovering URLs,
 *                            and by review when verifying URL suitability.
 *   REVIEW_ONLY_RULES      — only used by the /review-evaluation skill (not injected into
 *                            the citations prompt — they describe post-hoc verification).
 *
 * Per-property rules live in `.claude/skills/property-rules-{group}/SKILL.md`. The citation
 * prompt loads them at runtime via the internal `loadPropertyRule(propertyName)` helper. The
 * markdown skill files are also read directly by /research-sources, /review-evaluation, etc.
 * To add or modify a per-property rule, edit the markdown skill file.
 */

// prettier-ignore
export const WRITING_RULES = `
WRITING RULES:
1. Start your answer by directly addressing the property. The first sentence must answer the question.
2. Every sentence must be relevant to the property being evaluated. Do not include general descriptions of the protocol, its history, or unrelated features.
3. Prioritise information density. Every sentence should deliver a concrete fact.
4. Only state facts you are highly confident about. If uncertain, omit rather than guess. Never invent statistics, percentages, or quotes.
5. Distinguish current live features from planned/future ones. Future or "upcoming" features must not influence the chosen value; mention them in notes only if clearly marked as planned.
6. Never use "the document", "prior research", "the provided documentation", "indicates", or "confirms". Write as the expert, not as someone summarising a source.
7. Do not restate the value as a conclusion at the end of notes (e.g. "Therefore the answer is Yes", "In conclusion...", "Since X, the answer is Y"). The value field already captures the answer — notes explain reasoning.
8. Avoid marketing language ("banks", "your money", "advanced applied cryptography", "enhanced privacy", "cutting-edge", "innovative", "first practical application of").
9. Do not reference implementation artefacts — PRs, config files, variable names, line numbers, code identifiers, or proposal numbers (ZIP/EIP/BIP) unless the property is specifically about governance or upgradeability. Technical standards and primitives (BIP-32, BFT, zk-SNARKs, viewing keys, nullifier sets) are fine. You may mention a feature is proposed without naming the proposal.
10. Cite only text that directly proves or disproves the specific property. Do not cite general protocol descriptions or tangential information.
11. Do not copy long runs of source text. Whole sentences or multi-clause passages lifted verbatim must be reworded. Matching short phrases (up to ~10 words) to the source is fine and expected — citations attach to text that shares wording with the document, so do not rewrite naturally-phrased grounded statements just to avoid overlap.
12. Rewrite branded or capitalised terminology from protocol docs (e.g. "Private Balances", "Relay Adapt", "Shielded Pool") as lowercase generic equivalents ("private balances", "shielded pool") unless it is a proper noun. This applies even though short-phrase overlap with the source is otherwise fine — the goal is expert-voice neutrality, and citations still attach to the underlying paraphrase.
13. When a property involves cryptography, name standard primitives — proof system (Groth16, Plonky2, Halo2), curve (BN254, Baby Jubjub, Curve25519), signature (ECDSA, EdDSA, Schnorr), hash (Poseidon, Pedersen, MiMC), key derivation (BIP-32, ECDH). Do not use library names (e.g. "plonky2_bn254" → "BN254 curve"). Do not include raw derivation paths — name the standard instead.
14. Use correct English grammar and spelling. Prefer gender-neutral pronouns (their/they/them). "Sent" is the past tense of "send". Check subject-verb agreement and typos.
15. For opt-in privacy (e.g. shielded vs transparent), if the privacy feature exists and is usable, the answer is Yes.`;

// prettier-ignore
export const CROSS_CHECK_RULES = `
CROSS-CHECK RULES:
1. Compliance cross-check: the four compliance properties must be internally consistent. If "Type of compliance" = ["None"], then "Layer of enforcement" = "None", "Point of enforcement" = ["None"], and "Enforcement entities" = "None". If any of the four is non-None, all four must describe the same mechanism. Carveout: "Selective disclosure" is user-discretionary rather than entity-enforced, so when Type of compliance = ["Selective disclosure"] alone (no other policy), Layer / Entities / Point may all stay None — there is no entity enforcing voluntary key sharing at any point. The carveout does not apply if Selective disclosure is combined with another Type value, in which case the quartet must align around that other mechanism.
2. Compliance vs protocol rules: consensus-level validation and protocol-level proof verification on permissionless blockchains are NOT compliance. Compliance means active restriction or filtering by an entity — blocklists, allowlists, KYC gates, sanctions screening. Do not use proof verification, nullifier uniqueness, or issuance caps to justify a non-None Layer of enforcement.
3. Viewing-key cross-check: if "Selective disclosure: viewing entity" = ["None"], then "Selective disclosure: viewing control" = "None". A non-"None" viewing control requires that a viewing mechanism actually exists.
4. Multi-select contradictions: do not mix a concrete value with "None" (e.g. ["Selective disclosure", "None"] is invalid). If a mechanism exists, "None" must not also be selected.
5. Contract-level compliance audit: when a protocol is implemented as smart contracts, inspect the contract repository for (a) proxy patterns → Upgradeability ≠ Immutable; (b) onlyOwner / onlyRole gates → Enforcement entities ≠ None; (c) blocklist / allowlist hooks in _update, _beforeTokenTransfer, or transfer functions → Type of compliance includes the policy, Point of enforcement includes each path the hook runs in. Do not rely on whitepapers alone for these four properties.
6. The compliance quartet (Layer of enforcement, Enforcement entities, Type of compliance, Point of enforcement) must reflect compliance mechanisms that are currently live on the canonical protocol. Do not include documented future or "upcoming Beta" features. If the live protocol has no active compliance gate, all four must be None / ["None"], even if the roadmap adds KYT, wallet screening, or blocklists later — describe the planned features in notes instead.`;

// prettier-ignore
export const VALUE_FORMAT_RULES = `
VALUE FORMAT RULES:
1. Before writing any note claiming mainnet deployment, verify against the canonical deployment source (testnet README, deployment artifacts, block explorer). An incentivised-testnet deployment is not mainnet.
2. Do not embed deployed contract addresses, transaction hashes, or chain IDs in notes. Deployment status ("Sepolia testnet", "Ethereum mainnet") is acceptable — the forbidden part is the literal hex address, unless it is a canonical singleton that is a security-relevant invariant of the protocol.
3. Off-chain-only services (routing aggregators, custodial-style services without protocol contracts) still need a value from the enum for Upgradeability, Private state model, Private Data Storage, and Private State Scalability. Pick the closest option, and in notes state plainly that the property does not really apply because the service has no on-chain protocol contracts / no private state. Do not invent pseudo-commitments or host-chain properties to justify a value.
`;

// prettier-ignore
export const SOURCE_SELECTION_RULES = `
SOURCE SELECTION RULES:
1. The page must contain specific technical content about the property — not a table of contents, navigation page, or landing page.
2. Do not use PDF URLs — they cannot be processed. If the best source is a PDF, search for an HTML version of the same content.
3. Never use blog posts from exchanges, trading platforms, or non-official sources. Only blog posts from the protocol's own team or foundation. Prefer official docs, specs, or project websites over any blog.
4. URLs should point to specific pages, not docs landing pages. GitHub organisation roots (github.com/org) are acceptable for Open source properties. Individual repository roots should point to README or LICENSE where possible.`;

// prettier-ignore
export const REVIEW_ONLY_RULES = `
REVIEW-ONLY RULES:
1. Fetch every URL attached to a property and verify the notes and value are consistent with the page content. Flag dead URLs or cases where the page does not support the claim.
2. For any "TODO" in notes or values, web search for an answer. If a high-confidence answer is available from an authoritative source, propose replacing the TODO with it and cite the source. Otherwise leave the TODO and record it as "TODO: unresolved — needs manual research". Never guess.
3. Flag properties where notes say "we assume" or "we could assume".
4. Flag notes that describe a mechanism without answering the property question (e.g. describing cross-contract calls without stating whether this means DeFi access, or describing key derivation without stating how many independent secrets exist) as "notes explain how but not what".
5. For L2/L3 protocols, consult L2BEAT (https://l2beat.com/scaling/projects/{protocol}) as a primary reference for upgradeability, escape hatch, operator permissions, and finality, alongside protocol docs.
6. Preserve citations; prefer the smallest edit. The end state across the evaluation should be: most properties retain their citations[] array from Phase B; only a few carry "needsResearchReview": true. Reword only the sentences that violate a rule and drop individual citations[] entries whose cited_text no longer supports the corrected prose; keep every citation whose cited_text still substantiates what the notes now say. Rewrite from scratch only when every existing citation has been invalidated.
7. Flag and record the source. Whenever review changes a property's value or notes, set "needsResearchReview": true AND write the URL that verified the correction into the property's "url" field. If multiple URLs were used, pick the one that most directly substantiates the corrected claim. Purely editorial rewording (no new evidence) still needs the flag but may omit "url". A property may omit "needsResearchReview" only when its notes and value survive review unchanged AND every attached citation still substantiates the text.`;

/**
 * Property → property-rules group, used to find the right SKILL.md when looking up a per-property rule.
 * Properties marked out-of-scope (gas costs, anonymity set size) intentionally have no group.
 */
type PropertyName = (typeof PROPERTY_DEFINITIONS)[number]["name"];
type RulesGroup = "privacy" | "compliance" | "trust" | "cryptography" | "state-model" | "timing" | "composability";

const PROPERTY_GROUP: Partial<Record<PropertyName, RulesGroup>> = {
  "Anonymity": "privacy",
  "Confidentiality": "privacy",
  "Asset privacy": "privacy",
  "Plausible deniability": "privacy",
  "Type of compliance": "compliance",
  "Layer of enforcement": "compliance",
  "Enforcement entities": "compliance",
  "Point of enforcement": "compliance",
  "Selective disclosure: viewing entity": "compliance",
  "Selective disclosure: viewing control": "compliance",
  "Censorship resistance": "trust",
  "External network dependence": "trust",
  "Escape hatch": "trust",
  "Open source": "trust",
  "Upgradeability": "trust",
  "Third-party inspectability": "trust",
  "Cryptographic verifiability": "cryptography",
  "Post-quantum secure": "cryptography",
  "Number of secrets": "cryptography",
  "Client-side proving": "cryptography",
  "Private state model": "state-model",
  "Private Data Storage": "state-model",
  "Client-side indexing": "state-model",
  "Private State Scalability": "state-model",
  "Time-to-finality": "timing",
  "Deposit time": "timing",
  "Withdraw time": "timing",
  "Implementation maturity": "timing",
  "Access to DeFi": "composability",
  "Programmability / Generality": "composability",
};

/** Memoised so we only read each per-property skill markdown file once per process. */
const ruleCache = new Map<string, string | null>();

/**
 * Look up the per-property rule body for a property. Resolves the property's group, opens the
 * matching `property-rules-{group}/SKILL.md`, and extracts the `## {propertyName}` section.
 * Returns null when there's no group, no skill file, or the section is a "(no property-specific
 * rule yet …)" placeholder.
 */
function loadPropertyRule(propertyName: string): string | null {
  if (ruleCache.has(propertyName)) return ruleCache.get(propertyName)!;
  const rule = readPropertyRule(propertyName);
  ruleCache.set(propertyName, rule);
  return rule;
}

function readPropertyRule(propertyName: string): string | null {
  const group = PROPERTY_GROUP[propertyName];
  if (!group) return null;
  const skillPath = new URL(`../.claude/skills/property-rules-${group}/SKILL.md`, import.meta.url);
  if (!existsSync(skillPath)) return null;
  // Match the `## {Property Name}` header up to the next `##` or end-of-file.
  const escapedName = propertyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sectionRegex = new RegExp(`##\\s+${escapedName}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`);
  const match = readFileSync(skillPath, "utf-8").match(sectionRegex);
  const body = match?.[1].trim();
  if (!body || body.startsWith("(no property-specific rule yet")) return null;
  return body;
}

/** Rules assembled into the citations prompt for a given property. */
function citationRulesFor(property: PropertyContent): string {
  const perProperty = loadPropertyRule(property.name);
  const blocks = [WRITING_RULES, CROSS_CHECK_RULES, VALUE_FORMAT_RULES];
  if (perProperty) blocks.push(`PROPERTY-SPECIFIC RULE (${property.name}):\n${perProperty}`);
  return blocks.join("\n");
}

// prettier-ignore
export function buildEvaluationPrompt(
  property: PropertyContent,
  protocolName: string,
  researchSummary: string,
  context?: string,
): string {
  const allowed = property.options
    ? `Allowed values: ${property.options.join(" / ")}`
    : `Expected format: ${property.metric}`;
  return `
    You are a technical researcher evaluating privacy protocols for an objective report
    called "The State of Private Transfers 2026".

    Evaluate the "${property.name}" property for ${protocolName}.

    Property definition: ${property.description}
    Input type: ${property.inputType}
    ${allowed}

    ${context ? `IMPORTANT CONTEXT:\n${context}\n` : ""}

    Prior research found: ${researchSummary}

    ${citationRulesFor(property)}

    How to respond — follow this order strictly:
    1. FIRST, write your 2-4 sentence answer as natural prose BEFORE calling any tool. Ground each substantive claim in the provided document so citations attach automatically. Do NOT skip this step — the prose is where citations live; if you go straight to the tool call you lose all citation evidence.
    2. THEN, call the record_evaluation tool exactly once. If the document does not support any answer, pass insufficient_data=true and omit value.`;
}
