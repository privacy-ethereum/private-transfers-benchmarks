# Research scripts

1. Add the protocol to `scripts/research-config.ts`.
2. Run `/evaluate-protocol <id>`. All commands accept `--only "A,B"`.

`/evaluate-protocol` composes several steps, alternatively, you can run each step separately:

1. Add the protocol to `scripts/research-config.ts`.
2. Run `/research-sources <id>` in Claude Code to write `scripts/research-cache/<id>.json`.
3. Run `pnpm run research <id>` to write `src/data/evaluations/<id>.json`.
4. Run `/review-evaluation <id>` to check against the rules in `scripts/research-prompts.ts`.
