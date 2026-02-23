# GitHub Copilot Instructions for Private Transfers Benchmarks

> **Note:** These guidelines primarily apply to the `gas-benchmarks/` package but can serve as general standards for TypeScript code across the repository.

## Benchmarks definitions
- **Shield**: Converting public assets into private ones by depositing them into a privacy pool or protocol. (e.g. shield, bridge, encrypt, etc)
- **Unshield**: Converting private assets back into public ones by withdrawing them from a privacy pool or protocol. (e.g. unshield, bridge, decrypt, etc)
- **Transfer**: Moving private assets from one address to another within the privacy pool or protocol. (e.g. transfer, send, etc)

## 1. Clean and Concise Code

- Write clean, short code with minimal boilerplate
- **Do NOT add third-party dependencies** unless strictly necessary (approved: `viem`, `lowdb`, `dotenv`)
- Avoid premature abstractions. Only abstract when you have 2+ implementations or clear reuse cases
- Maintain detailed JSDoc comments on constant exports with GitHub links, `Emits:` section, and `@example` URLs
  - See `src/privacy-pools/constants.ts` or `src/railgun/constants.ts` for examples
  - Validated by `src/__tests__/constants.test.ts`
- Minimize inline comments - code should be self-explanatory
- No `console.log` (prohibited by ESLint)

## 2. Use examples and references in comments
- You can use the URLs in the comments to fetch information about the contract (events, functions, etc.). This is useful for understanding context and debugging.

## 3. Functional Programming Over Loops

- **PREFER** `forEach()`, `map()`, `reduce()`, `filter()`, `every()`, `some()` over `for`/`while` loops
- Use `Promise.all()` for parallel async operations
- Exception: loops acceptable for complex control flow (see `src/utils/rpc.ts` pagination)
- Examples: `src/utils/utils.ts`, `src/utils/rpc.ts`, `src/index.ts`

## 4. Type Organization

- **ALL** types/interfaces MUST be in dedicated `types.ts` files
- **NEVER** define types inline in implementation files
- Locations: `src/utils/types.ts` (shared), `src/__tests__/types.ts` (test-specific)
- Use inline type imports: `import type { Type } from "./types.js";`

## 5. Utility Function Organization

- **ALL** reusable functions MUST be in dedicated utility files
- **NEVER** define utilities inline with implementation code
- Locations: `src/utils/utils.ts`, `src/utils/rpc.ts`, `src/utils/db.ts`, `src/__tests__/utils.ts`
- Prefer pure functions that minimize side effects

## 6. Clean Code Principles

- Follow Clean Code guidelines, but rules 1-4 above take precedence if there's a conflict

## 7. Testing Requirements

- **ALWAYS** run `pnpm run test` and `pnpm run benchmark` after changes
- Do NOT complete work without running these verification steps
- Fix all test failures and benchmark errors before finalizing

## Examples

- Protocol patterns: `src/railgun/index.ts`, `src/tornado-cash/index.ts`, `src/privacy-pools/index.ts`
- Protocol specific constants to interact with: `src/railgun/constants.ts`, `src/tornado-cash/constants.ts`, `src/privacy-pools/constants.ts`
- Functional programming: `src/utils/utils.ts`, `src/utils/rpc.ts`, `src/index.ts`
- Type organization: `src/utils/types.ts`, `src/__tests__/types.ts`
