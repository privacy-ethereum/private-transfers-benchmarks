import { existsSync, readFileSync } from "fs";
import type { PropertyContent } from "../src/types.js";
import { type PROPERTY_DEFINITIONS } from "../src/data/schema.js";

/**
 * Cross-cutting rules for evaluation authoring and review.
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
6. Never use meta-source hedges. Forbidden: "the document", "prior research", "the provided documentation", "indicates", "confirms", "is described", "is not described", "is not specified", "is not documented", "indicating", "suggesting", "based on", "leaves open whether". Write as the expert, not as someone summarising a source — if the protocol does X, state "the protocol does X", not "the protocol is described as doing X". If a fact is missing from the sources, drop the sentence or set \`needsResearchReview\`; do not narrate the absence.
7. Do not restate the enum value anywhere in the notes — neither at the end nor mid-sentence. Forbidden patterns include "Therefore the answer is Yes", "In conclusion...", "Since X, the answer is Y", "Anonymity is Yes for users", "the value is No because...", "is set to Single admin". Also forbidden: opening the notes with a bare value-word ("No.", "Yes —", "None,", "Not applicable.") and semantic restatements that re-assert the verdict in other words ("X is private because…", "this is censorship-resistant since…"). The value field already captures the answer; notes explain reasoning.
8. Avoid marketing language ("banks", "your money", "advanced applied cryptography", "enhanced privacy", "cutting-edge", "innovative", "first practical application of").
9. Do not reference implementation artefacts — PRs, config files, variable names, line numbers, code identifiers, or proposal numbers (ZIP/EIP/BIP) unless the property is specifically about governance or upgradeability. Technical standards and primitives (BIP-32, BFT, zk-SNARKs, viewing keys, nullifier sets) are fine. You may mention a feature is proposed without naming the proposal.
10. Cite only text that directly proves or disproves the specific property. Do not cite general protocol descriptions or tangential information.
11. Independent voice. Notes are your expert summary of what the cited sources establish — not a quotation. Two requirements: (a) Sentence-level restructuring — the syntactic structure of each notes sentence must differ from the cited source sentence; multi-clause patterns ("X holds Y and manages Z by …") from the source must be recast, not mirrored. (b) Named-primitive passthrough — curve names (BN254, Curve25519, Grumpkin), cryptographic primitives (X25519-XChaCha20-Poly1305, Schnorr, Poseidon, Noir, Barretenberg), proper nouns (Predicate, ERC-4337, EIP-7702), and standard identifiers stay verbatim where they appear; everything else (verbs, connectors, sentence shape, surrounding clauses) gets restructured. A reviewer reading notes alone should hear your voice, not the docs'. This supersedes any prior "matching short phrases up to ~10 words is fine" allowance — that now applies only to named primitives and proper nouns.
12. Rewrite branded or capitalised terminology from protocol docs (e.g. "Private Balances", "Relay Adapt", "Shielded Pool") as lowercase generic equivalents ("private balances", "shielded pool") unless it is a proper noun. This applies even though short-phrase overlap with the source is otherwise fine — the goal is expert-voice neutrality, and citations still attach to the underlying paraphrase.
13. When a property involves cryptography, name standard primitives — proof system (Groth16, Plonky2, Halo2), curve (BN254, Baby Jubjub, Curve25519), signature (ECDSA, EdDSA, Schnorr), hash (Poseidon, Pedersen, MiMC), key derivation (BIP-32, ECDH). Do not use library names (e.g. "plonky2_bn254" → "BN254 curve"). Do not include raw derivation paths — name the standard instead. Do not use compound-dashed cryptography terms ("commitment-and-nullifier", "note-and-nullifier", "deposit-and-withdrawal") — separate them ("commitment and nullifier") or pick one ("commitment" / "nullifier"). Do not parrot protocol-idiosyncratic terminology (e.g. "satellite verifier") in notes when an industry-standard term covers the same idea ("verifier contract") — use the standard term. Internal jargon (OSI / OSI-approved / OSI-licensed-core) belongs in reasoning, never in notes — say "open source" or name the specific licence (Apache-2.0, MIT) instead.
14. Use correct English grammar and spelling. Prefer gender-neutral pronouns (their/they/them). "Sent" is the past tense of "send". Check subject-verb agreement and typos.
15. For opt-in privacy (e.g. shielded vs transparent), if the privacy feature exists and is usable, the answer is Yes.
16. Punctuation: notes must not contain space-before-comma (\` ,\`) or space-before-period (\` .\`). Write "X, Y, and Z" not "X ,Y ,and Z". Notes must not contain bare URLs or markdown links — citations live in the citations array, not in prose.
17. Citation budget. Attach at most 4 citations when they all come from one source document; with two sources, at most 3 from each (6 total) — this is the default and has been load-bearing in practice; with three sources, at most 2 from each (6 total). Every citation must independently substantiate a distinct load-bearing claim in the notes — if you are at the budget you are probably over-citing, so keep the ones that each prove something different and drop the rest. Citations from the same source must not overlap or be adjacent in \`cited_text\` — two citations from the same URL whose \`cited_text\` spans overlap, or are contiguous slices of the same paragraph, are double-counting the same evidence; merge them into one span, or drop the redundant one (the tighter / shorter span is usually the right one to keep). Each \`cited_text\` span MUST be ≤200 chars — this is a HARD CAP, not a target. Spans over 200 chars are rejected at lint and force per-protocol rework, so do not ship them. Aim for 75-200 chars and select the tightest contiguous span that contains the load-bearing clause. Example: a 450-char paragraph that mentions the load-bearing fact mid-sentence should be trimmed to the ~100-150 chars surrounding that specific clause, dropping introductory framing and trailing context — do NOT cite the whole paragraph. Never widen the span or switch to the bare \`{ source }\` form to dodge the cap (that carveout is reserved for code constants, licence files, block-explorer entries and GitHub repo listings).
18. Avoid AI-tell prose. Do not use semicolons in notes — split into two sentences with a full stop, or use an em-dash sparingly. Do not use temporal hedges that bake in an update obligation: "currently", "recently", "still", "at the time of writing", "as of writing", "is recent". Anchor time-sensitive facts to a specific date when one exists ("the audit publishes in Q2 2026", "deployed in November 2025") so the sentence stays true after the date passes; otherwise omit the time framing.
19. Length. Target 200-500 chars per property (~40-90 words); hard cap 500 chars. If your notes are running long, you are almost certainly explaining mechanism rather than answering the property — mechanism belongs in the protocol's top-level description, not 30 times across properties. Trim until every sentence is load-bearing for the chosen value or a boundary caveat that could flip the verdict. Critical: when tightening to fit the cap, load-bearing tokens the value rests on (durations like "1m 12s" or "38m 24s", hex addresses, named parameters, dated launch tokens) MUST survive in at least one citation's \`cited_text\`. Trimming that strips them leaves the value unsubstantiated and the notes claiming a number with nothing in citations to prove it — pull a different contiguous span from the cached source that keeps the token rather than dropping it.
20. Justify "None" / "N/A" / "Not applicable" values explicitly. When the chosen value is the empty/absent option because the protocol does not have the mechanism the property asks about (rather than an explicit policy choice of "no, none"), notes MUST state that absence directly — e.g. "no viewing-key mechanism exists, so this property has nothing to control", "the protocol maintains no private state of its own", "no compliance gate is enforced". A bare "None" without that justification leaves the reader unable to distinguish "explicitly None" from "the property does not apply". This is mandatory whenever the value is None, N/A, or Not applicable. The inverse also holds: when the property has a non-empty / concrete value, do NOT close the notes with an absence-of-mechanism disclaimer ("no KYC is described", "no viewing key is documented", "no challenge window is described"). Those sentences are only appropriate for None/N/A/Not applicable values — on a property with a concrete value they restate what is already absent by the value's contrast with other enum options. Drop the absence sentence or convert it into a positive cross-reference (e.g. "selective disclosure is covered separately").
21. Drop contrastive framing when the positive statement alone carries the point. Phrases like "rather than X", "as opposed to", "instead of", "not on Y" pad the note with what the protocol is NOT — state what it does ("balances update in place" beats "balances update in place rather than appending a note"). Keep the contrast only when X is an alternative the reader genuinely expects and the distinction is the property's answer (a validium posting commitments "rather than data" is the load-bearing point); otherwise cut the clause.`;

// prettier-ignore
export const CROSS_CHECK_RULES = `
CROSS-CHECK RULES:
1. Compliance cross-check: the four compliance properties must be internally consistent. If "Type of compliance" = ["None"], then "Layer of enforcement" = "None", "Point of enforcement" = ["None"], and "Enforcement entities" = "None". If any of the four is non-None, all four must describe the same mechanism. Carveout: "Selective disclosure" is user-discretionary rather than entity-enforced, so when Type of compliance = ["Selective disclosure"] alone (no other policy), Layer / Entities / Point may all stay None — there is no entity enforcing voluntary key sharing at any point. The carveout does not apply if Selective disclosure is combined with another Type value, in which case the quartet must align around that other mechanism.
2. Compliance vs protocol rules: consensus-level validation and protocol-level proof verification on permissionless blockchains are NOT compliance. Compliance means active restriction or filtering by an entity — blocklists, allowlists, KYC gates, sanctions screening. Do not use proof verification, nullifier uniqueness, or issuance caps to justify a non-None Layer of enforcement.
3. Viewing-key cross-check: if "Selective disclosure: viewing entity" = ["None"], then "Selective disclosure: viewing control" = "None". A non-"None" viewing control requires that a viewing mechanism actually exists.
4. Multi-select contradictions: do not mix a concrete value with "None" (e.g. ["Selective disclosure", "None"] is invalid). If a mechanism exists, "None" must not also be selected.
5. Contract-level compliance audit: when a protocol is implemented as smart contracts, inspect the contract repository for (a) proxy patterns → Upgradeability ≠ Immutable; (b) onlyOwner / onlyRole gates → Enforcement entities ≠ None; (c) blocklist / allowlist hooks in _update, _beforeTokenTransfer, or transfer functions → Type of compliance includes the policy, Point of enforcement includes each path the hook runs in. Sweep beyond the named transfer hooks: an on-chain blocklist/allowlist check anywhere in the operation-processing path — a deposit screen, a transact-time "is this address/token blacklisted" check, a sequencer/bundler-side gate enforced on-chain — is a list-based gate (POI/ASP) that must be reflected in the quartet, even when it lives in a docs span attached to a non-compliance property (e.g. a Verifiability or operation-flow citation). Do not rely on whitepapers alone for these four properties.
6. The compliance quartet (Layer of enforcement, Enforcement entities, Type of compliance, Point of enforcement) must reflect compliance mechanisms that are currently live on the canonical protocol. The test is operational status, not the "Beta" label: if a feature is described in present-tense operational documentation (FAQ, compliance docs, integration guides) as something the system currently does — "Mirage runs a wallet screening check at escrow deployment", "the contract enforces an OFAC blocklist" — count it as live, even when the broader product is in alpha/beta. Do NOT count features described only in future-tense roadmap language ("we will add X", "in Q3 we plan to launch Y", "the upcoming Beta release will introduce Z"). If the live protocol has no active compliance gate by that test, all four must be None / ["None"], with planned features described in notes only.
7. Deployed constants override prose. When a numeric parameter — epoch length, reward schedule, supply cap, fee, tree depth, timelock duration — appears both in marketing/whitepaper text and as a constant in a deployed contract, the contract value is authoritative; read it, cite it, and use it. If you cannot read the contract, use the documented figure but set \`"needsResearchReview"\` to a reason string naming the unread constant (e.g. \`"epoch length not read from deployed contract; documented figure used."\`).
8. Censorship resistance ⇐ enforcement mechanisms. If any entity can stop a specific valid transfer or withdrawal under normal operation — an asset-level blocklist/allowlist hook that reverts on listed addresses, a sanctions/KYT screen applied at deposit or withdrawal, a deposit guard whose approval the protocol can withhold, or a permissioned executor set with no permissionless fallback path for the user — then Censorship resistance = No, regardless of how permissionless the underlying chain is. Combine with rule 5: if a blocklist hook makes Enforcement entities ≠ None, it almost certainly makes Censorship resistance = No as well. An admin's power to upgrade, swap, or brick the verifier or implementation is an availability and upgrade risk captured by Upgradeability, NOT by itself a censorship-resistance failure: do not set Censorship resistance = No on upgrade authority alone. An upgradeable-proxy verifier with no active user-level gate is still Yes when the protocol is otherwise permissionless.
9. Cryptographic primitive consistency. When Number of secrets, Post-quantum secure, Verifiability, and Private state model name the same primitive (curve, signature scheme, hash, encryption scheme), the named primitive must be the same across all four. A cross-property mismatch (e.g. one property says "spending key on Curve25519" and another says "spending key on Grumpkin") is a factual contradiction and must be resolved against the protocol's own primary docs. If the protocol's own docs disagree internally (different pages naming different curves/schemes for the same key), set \`needsResearchReview\` on each affected property to a reason string naming the docs contradiction (e.g. \`"signing-scheme doc names Grumpkin; key-generation doc names Curve25519 — primary-source contradiction"\`) and pick the value that the most-specific page supports.`;

// prettier-ignore
export const VALUE_FORMAT_RULES = `
VALUE FORMAT RULES:
1. Before writing any note claiming mainnet deployment, verify against the canonical deployment source (testnet README, deployment artifacts, block explorer). An incentivised-testnet deployment is not mainnet. Any date that is a claim about the protocol — launch month, mainnet deployment date, audit date, "live since X" — must be backed by a citation (block-explorer first transaction, dated announcement, audit report); if you cannot source it, give a range or say the date is not documented rather than asserting one. (Dating the evaluation itself, "as of <date>", is exempt.)
2. Do not embed deployed contract addresses, transaction hashes, or chain IDs in notes. Deployment status ("Sepolia testnet", "Ethereum mainnet") is acceptable — the forbidden part is the literal hex address, unless it is a canonical singleton that is a security-relevant invariant of the protocol.
3. Off-chain-only services (routing aggregators, custodial-style services without protocol contracts) still need a value from the enum for Upgradeability, Private state model, Private Data Storage, and Private State Scalability. Pick the closest option, and in notes state plainly that the property does not really apply because the service has no on-chain protocol contracts / no private state. Do not invent pseudo-commitments or host-chain properties to justify a value.
4. Do not emit INSUFFICIENT_DATA when a sensible enum default exists for the protocol type. Application-layer protocols deployed on existing chains use "Underlying chain" for Time-to-finality (finality inherited from the host chain); they use 0 for Deposit time / Withdraw time when no protocol-imposed queue, challenge window, or time-lock is documented (host-chain block latency is not a waiting period). For Escape hatch and Upgradeability where source is not public, pick the conservative enum (No / Single admin) and set \`needsResearchReview\` to a reason string naming the missing source — INSUFFICIENT_DATA is reserved for genuinely unanswerable cases, not "the closed-source pick is uncertain".
5. Grade on what the protocol makes POSSIBLE, not only its default configuration. When a determined user can reach stronger privacy by self-hosting infrastructure (their own RPC node, relayer, sequencer, or indexer), the value reflects that achievable best case even if the path is prohibitive for a typical user and the default is more exposed (e.g. Third-party inspectability = No when a user can run their own indexer or relayer to avoid observation). State the configuration the value assumes in the notes, and flag the more-exposed default as a caveat.
6. Era discipline for two-version protocols. When a protocol has a LIVE deployment on one architecture or proof system and a documented redesign on another (different proof system, curve, settlement layer, or data-availability model), attribute each named primitive and the settlement model to the era that actually uses it — never state the redesigned stack as the live one, or the legacy stack as current. Decide which era the eval grades, hold every property to that era consistently, and classifying a documented capability as "roadmap" or "not live" requires its own dated citation, not the evaluator's outside knowledge. If the deployed era is genuinely unconfirmed, pick the conservative maturity tier and set needsResearchReview naming the unconfirmed deployment.
`;

// prettier-ignore
export const SOURCE_SELECTION_RULES = `
SOURCE SELECTION RULES:
1. The page must contain specific technical content about the property — not a table of contents, navigation page, or landing page. Never cite the marketing apex domain of the protocol (e.g. {protocol}.xyz/, {protocol}.io/, {protocol}.com/ — the root URL whose only purpose is hero copy and CTAs) — always point at the documentation subdomain (docs.{protocol}.*) or a specific docs subpath. Never cite X / Twitter profiles or posts as authoritative for current-state facts; their use is forbidden even when the protocol team posts there. Before declaring a docs site empty, probe /sitemap.xml and /llms.txt — many docs sites have a placeholder root but a populated sitemap (the Bermuda first-pass failure mode).
2. Do not use PDF URLs — they cannot be processed. If the best source is a PDF, search for an HTML version of the same content.
3. Never use blog posts from exchanges, trading platforms, or non-official sources. Only blog posts from the protocol's own team or foundation. Prefer official docs, specs, or project websites over any blog. Third-party crypto-news aggregators (cointrust.com, cryptobriefing.com, bitcoinist.com, cointelegraph.com, decrypt.co, theblock.co, and similar) are non-authoritative even when reached via a research-cache URL — they typically restate an announcement without primary-source rigour. When the only available source for a dated claim is one of these domains, substitute the protocol's own announcement (X/Twitter post, Mirror post, official blog) and set \`needsResearchReview\` to a reason string naming the substitution if the primary source cannot be located in this pass.
4. URLs should point to specific pages, not docs landing pages. GitHub organisation roots (github.com/org) are acceptable for Open source properties. Individual repository roots should point to README or LICENSE where possible.
5. Prefer official documentation over GitHub blob URLs when both cover the same topic. GitHub blob URLs (\`github.com/org/repo/blob/...\`) are acceptable only for facts that aren't covered in the docs — license, deployment scripts, contract-only details, or governance constants. If the protocol's own docs answer the property directly, cite the docs page. Exception: a GitHub organisation root (\`github.com/{org}\`) may be co-cited alongside a canonical non-github source when the org page carries unique substantive prose (e.g. an architecture description or proving-stack caveat) that no equivalent docs page covers; the \`github-when-canonical-cited\` lint warning in such cases is a known false positive, not a rule violation.
6. Discover up to three independent sources per property — two is the default and has been load-bearing in practice. Record every chosen URL in the research cache; the reviewer-LLM may end up citing one or several, but every recorded URL is ingested at evaluation time so the LLM has cross-reference. Sources should differ in domain when possible (e.g. official docs + L2BEAT, official docs + GitHub README, official docs + audit report). Add a third source only when distinct load-bearing claims rest on distinct documents (e.g. mechanism on official docs + compliance gate on contract README + dated-deployment evidence on a separate announcement). One URL alone is acceptable when a single source covers every load-bearing claim (e.g. a license file for Open source).
7. For "Third-party inspectability", prefer the protocol's own docs or contract source. Forum threads (ethresear.ch, ethresearch, twitter) are acceptable only for forward-looking design discussions, not current-state facts. If a forum post is the only source for a current-state claim, treat the claim as unverified and set \`needsResearchReview\` to a reason string naming the unverified claim.`;

// prettier-ignore
export const REVIEW_ONLY_RULES = `
REVIEW-ONLY RULES:
1. Fetch every URL attached to a property and verify the notes and value are consistent with the page content. Flag dead URLs or cases where the page does not support the claim.
2. For any "TODO" in notes or values, web search for an answer. If a high-confidence answer is available from an authoritative source, propose replacing the TODO with it and cite the source. Otherwise leave the TODO and record it as "TODO: unresolved — needs manual research". Never guess.
3. Flag properties where notes say "we assume" or "we could assume".
4. Flag notes that describe a mechanism without answering the property question (e.g. describing cross-contract calls without stating whether this means DeFi access, or describing key derivation without stating how many independent secrets exist) as "notes explain how but not what".
5. For L2/L3 protocols, consult L2BEAT (https://l2beat.com/scaling/projects/{protocol}) as a primary reference for upgradeability, escape hatch, operator permissions, and finality, alongside protocol docs.
6. Preserve citations that substantiate load-bearing claims — but remove those that don't. Every citation on a property must independently substantiate a distinct load-bearing claim in that property's notes. If a citation covers adjacent context (a neighbouring SDK example, a tangential paragraph from the same page, a recommended-against alternative path) without supporting a load-bearing claim, remove it — even if it's from the same authoritative source. Citation budget per rule 17 is a ceiling, not a floor; fewer load-bearing citations beats more incidental ones. If a citation's cited_text no longer matches the rewritten notes BUT the citation still proves a load-bearing claim, prefer rewriting the notes to use the cited evidence. Reviewer judgement: a citation is "wrong" (wrong protocol, factually contradictory) OR "incidental" (doesn't substantiate any load-bearing claim) — both warrant removal. Citations that prove the load-bearing claim are critical evidence and must be preserved.
7. \`needsResearchReview\` is a non-empty reason string ≤120 chars in a single sentence, following the template \`"{specific fact} not {classified/cited/described} in {source description} — {one-clause consequence}"\`. The 120-char cap is enforced by the \`research-review-too-long\` lint rule. No semicolons (\`semicolon-in-research-review\` lint), no boolean, no "needs review" or "TBD" placeholder. The schema forbids \`true\`. A valid reason names the unresolved fact in one sentence (e.g. \`"on-chain admin slot not classified — EOA vs multisig wrapper unverified"\`). The named question must be substantive to the current notes and citations — if a previous edit removed the claim the flag was pointing at (e.g. the cited cointrust.com URL was dropped along with the dated-demo sentence), the flag is orphaned and MUST be cleared (delete the field), not carried forward. The default through a review pass is to leave the flag as you found it; only set it when factual uncertainty remains after your edits, and clear it (delete the field) when you have resolved that uncertainty. Review SHOULD fix mechanical and stylistic defects without flagging — punctuation, code identifiers / variable names / file names lifted into prose, expert-voice rewording, trimming verbose passages, swapping a page-chrome citation span for the substantive span on the same page (rule 10), reordering. None of that re-sets the flag or needs a new citation. Set or keep \`needsResearchReview\` only when a factual question is left open after your edits, for example: (a) you changed the value but the new value rests on a re-reading you could not fully cross-check against the available sources (one source said X, you couldn't find a second to confirm); (b) you changed a factual claim in the notes that you could not fully ground in cited sources; (c) an unresolved TODO remains in the notes or value; (d) a citation's \`cited_text\` could not be reconciled with the source and could not be re-cited. A value or factual notes change that IS fully grounded in a source does NOT flag — attach a citation for the URL that verified it and leave the flag off; the citation is what verifies the correction. Prefer the full citation form (\`{ cited_text, source }\`) over a bare \`{ source }\`: re-run \`pnpm run research <protocol> --only "<property>"\` so the API extracts the substantive span from the cached source. The bare \`{ source }\` form is acceptable only when there is no quotable prose span on the page — a license file, a GitHub repo/org listing, a block-explorer page showing a value, a code constant. Review MAY (and SHOULD) clear a pre-existing flag once value and notes check out against the sources and every citation substantiates the text, even if it tidied the prose along the way. Review's job is to fix issues, keep or improve the citations, and confirm the result — not to leave a property flagged for having been cleaned up.
8. Citations belong to the property they substantiate. A claim that is load-bearing for a property's value or notes must trace to one of that property's own citations — not a sibling property's, not a generic component description, not an intro/landing-page blob. If the only attached citation does not itself prove the load-bearing claim, flag the property by setting \`needsResearchReview\` to a reason string naming the unsubstantiated claim, and either re-cite it or, when the citation is genuinely off-target rather than merely unused, remove it (see rule 6's removal bar).
9. Component-name check: contract names, module names, service names, and similar identifiers used in notes must actually appear in the protocol's own documentation or source. Flag any that look copied from a template or another protocol (e.g. an "aggregator" or "vault" component named in notes that this protocol never uses).
10. Page-chrome citations. Flag citations whose cited_text is page chrome rather than substance — nav menus, social links, footers, "N followers", "Copy page", "Last updated N ago", cookie/consent banners, GitHub repo-list UI fragments, "Skip to main content". They prove nothing; re-cite the substantive span on the same page, or remove the citation (chrome-only cited_text counts as genuinely off-target under rule 6's removal bar). Apply the same scrutiny to over-broad spans that bundle the load-bearing sentence with unrelated content from the same page — e.g. a cited_text that covers the load-bearing line (an OFAC-blocklist mention) plus a thousand chars of unrelated architecture listings (LiquidityManager, Indexer, Hub) that say nothing about the property at hand. The cited span should be tight around the substantive sentence(s); to tighten, re-run \`pnpm run research <protocol> --only "<property>"\` so the API produces a fresh citation with the correct span. Do NOT downgrade a full citation to a bare \`{ source }\` citation as a shortcut — that loses cited-text evidence; the bare form is acceptable only when no quotable prose span exists on the page (a license file, a GitHub repo/org listing, a block-explorer page).
11. Verbatim prose repetition. Flag when the same multi-clause sentence appears verbatim or near-verbatim in 3+ properties' notes (e.g. one OFAC-screening sentence copied across the compliance quartet). Reword all but at most one — notes are prose, not evidence, so duplication has no upside. This is about prose, not citations: reusing the same cited_text across properties is fine when it actually substantiates each one.
12. Notes claims must not exceed citations. Every load-bearing factual claim in the notes must be substantiated by at least one of the property's citations — same fact in cited_text, paraphrased is fine, but the supporting clause must be in cited_text, not adjacent context. Specific lists of operations ("transfers, mints, burns, wrap, unwrap"), specific quantities, specific dates, named subsystems, and inferred conclusions that go beyond what cited_text states are violations. Either reword the notes to match what the cited evidence literally says, or set \`needsResearchReview\` to a reason string naming the unsubstantiated claim. If a reviewer cannot point to the supporting clause in one of the citations, the claim is not substantiated. Synonym restatement of the failure mode ("every balance change" → "balance-changing entry points") does not escape this rule — the substantive fact must be in cited_text. Document-attribution check: when the notes name the document a claim comes from ("the kohaku README states", "the bermudabay landing page says", "the audit report finds"), the cited source for that claim must match the named document. Mismatches indicate cross-referenced material was copied without updating the attribution — fix by renaming the attribution to the actual source, or by adding the named document as a citation if the claim genuinely traces to it.
13. No speculative admin/governance prose. For Upgradeability and Enforcement entities, do NOT write phrases that guess the admin's composition when no on-chain evidence is cited — forbidden patterns include "treated as a single privileged key", "absent on-chain evidence", "pending a published governance document", "is not disclosed", "operational control is treated as", "the upgrade authority is treated as". The honest answer when the admin address has not been classified on-chain is: pick the conservative enum (typically Single admin) AND set \`needsResearchReview\` to a reason string naming the unverified admin composition. The notes describe the role that exists in docs; they do not narrate the absence of evidence.
14. No speculative maturity dates. For Implementation maturity, do NOT write phrases that infer a launch date from absence of evidence — forbidden patterns include "available evidence places it within the past year", "the date is not stated in the documentation but…", "based on the audit timing…", "likely within X". If the launch date is not directly cited (block-explorer first tx, dated announcement, audit report), describe the maturity tier honestly and set \`needsResearchReview\` to a reason string naming the missing date. Operational quirks unrelated to maturity (e.g. "decider-prover crashes in Docker") do not belong in this property's notes. A date that appears only in a blog post's URL slug or page header (e.g. \`/blog/announcing-the-alpha-network\` published "31 Mar") is page chrome, NOT a cited_text span — to anchor a launch date, the YYYY-(MM-DD) string must appear inside a citation's \`cited_text\`, not be inferred from the URL or HTML metadata.
15. Subject-attribution check. A figure, capability, or property stated in a citation's \`cited_text\` must be ascribed by the source to THIS protocol — not to prior art, a competitor, generic tooling, or a motivating example the source contrasts against. When the cited span attributes the fact to a different subject (e.g. "most zk tech at the time took five minutes to prove on a phone", "unlike other rollups"), the notes must not restate it as a fact about this protocol. Flag and reword to what the source says about this protocol specifically, or drop the claim.`;

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
  "Verifiability": "cryptography",
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

/** Concatenate the cross-cutting rule blocks with the per-property rule (when present) for one property. */
function citationRulesFor(property: PropertyContent): string {
  const perProperty = loadPropertyRule(property.name);
  const blocks = [WRITING_RULES, CROSS_CHECK_RULES, VALUE_FORMAT_RULES];
  if (perProperty) blocks.push(`PROPERTY-SPECIFIC RULE (${property.name}):\n${perProperty}`);
  return blocks.join("\n");
}

/**
 * Build the user-message text sent to Claude when evaluating one property. Combines the
 * property's schema metadata (definition, allowed values), the prior research-cache summary,
 * any protocol-level disambiguation `context` from research-config, and the assembled rule
 * blocks. Called once per property per protocol from research.ts.
 */
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
    2. Anchor each load-bearing claim to the source's load-bearing sentence — paraphrase the specific sentence that proves the fact, sharing short phrases with it, rather than restating the surrounding architecture context. The API picks spans whose wording overlaps your prose, so anchoring on the substantive sentence biases extraction toward the substantive span, not adjacent context. When two paragraphs each carry a different load-bearing fact, write two distinct sentences (one paraphrasing each) so the API can attach two tight spans rather than one wide span.
    3. THEN, call the record_evaluation tool exactly once. If the document does not support any answer, pass insufficient_data=true and omit value.`;
}
