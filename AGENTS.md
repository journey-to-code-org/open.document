# AI agent guidance

AI-assisted contributions are welcome.

Before editing:

1. Read `README.md` and all tests.
2. Understand the contracts of the four composed packages.
3. Identify whether the requested behavior belongs in `open.document` or in a
   lower-level dependency.

During implementation:

- Do not duplicate slug, text-analysis, outline, or Markdown-parser logic.
- Keep `analyzeDocument()` deterministic.
- Preserve unique heading IDs and 1-based source ranges.
- Do not add HTML rendering, sanitization, filesystem access, DOM behavior, or
  publishing logic.
- Add tests for every returned-model change.
- Avoid unrelated refactors.

Completion reports should include changed document fields, dependency impacts,
tests run, and compatibility implications.
