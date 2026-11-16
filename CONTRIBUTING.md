# Contributing

Use Node 18.18+ for development (Node 22 is recommended). The published runtime
supports Node 18+. Fork the repository and create a branch from main.

```sh
npm install --package-lock=false
npm run typecheck
npm run lint
npm run test:coverage
npm run build
```

Add regression tests for behavior changes. Money arithmetic must use integer
paise; never multiply rupee numbers to calculate tax or totals. Document rounding
and validate that README outputs match the implementation. Keep runtime
dependencies at zero. Public functions require JSDoc and examples.

Run `npm run format` before opening a pull request. Run `npx changeset` for a
user-facing change and commit its generated file. Explain the problem, solution,
compatibility impact and verification. CI requires 95% coverage in all metrics.

Development dependency ranges are intentionally used without a committed lockfile
in this starter. For reproducible maintenance builds, generate and commit
`package-lock.json`, then change CI and release installation to `npm ci`.

Do not include real customer invoices, identity documents, credentials or npm
tokens in issues or tests. Use synthetic fixtures. Follow CODE_OF_CONDUCT.md.
