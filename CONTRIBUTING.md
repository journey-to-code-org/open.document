# Contributing

`open.document` is a composition layer. Keep it focused on producing a stable
document model from the smaller Journey to Code packages.

## Development

```bash
npm install
npm test
```

## Pull requests

Changes should:

- preserve the `analyzeDocument()` public contract,
- keep responsibilities in the correct lower-level package,
- add tests for changed document-model behavior,
- preserve deterministic heading IDs,
- avoid adding HTML rendering, DOM behavior, or publishing logic,
- update documentation when returned data changes.

## Design rule

If a behavior belongs naturally in `open.slug`, `open.text`, `open.outline`,
or `open-markdown-parser`, improve that package instead of reimplementing it
here.
