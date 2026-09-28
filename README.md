# open.document

A small document-analysis layer that composes the Journey to Code Markdown
tooling into one normalized document object.

`open.document` does not render HTML. It turns Markdown source into structured
data that editors, previews, publishing systems, documentation tools, and other
consumers can use.

## Install

```bash
npm install @journey-to-code/open-document
```

## Usage

```js
import { analyzeDocument } from "@journey-to-code/open-document";

const document = analyzeDocument(`
# Hello world

This is a short document.

## Installation

Read the [docs](https://example.com).

## Installation
`);
```

The result contains:

```js
{
  source: "...",
  plainText: "Hello world\n\nThis is a short document.\n\nInstallation\n\nRead the docs.\n\nInstallation",

  headings: [
    {
      level: 1,
      text: "Hello world",
      id: "hello-world",
      range: { startLine: 2, endLine: 2 }
    },
    {
      level: 2,
      text: "Installation",
      id: "installation",
      range: { startLine: 6, endLine: 6 }
    },
    {
      level: 2,
      text: "Installation",
      id: "installation-2",
      range: { startLine: 10, endLine: 10 }
    }
  ],

  outline: [/* nested heading tree */],

  links: [
    {
      href: "https://example.com",
      text: "docs",
      title: null
    }
  ],

  images: [],
  codeBlocks: [],

  stats: {
    words: 12,
    characters: 82,
    charactersWithoutWhitespace: 70,
    sentences: 5,
    paragraphs: 5,
    readingTime: {
      words: 12,
      minutes: 0.05333333333333334,
      roundedMinutes: 1,
      wordsPerMinute: 225
    }
  },

  tokens: [/* normalized Markdown tokens */]
}
```

Exact text-statistic values depend on the input and segmentation environment.

## API

### `analyzeDocument(source, options?)`

Analyzes Markdown source and returns a normalized document model.

### Options

```js
analyzeDocument(source, {
  locale: "en",
  wordsPerMinute: 225,

  headingIds: true,
  headingIdPrefix: "",

  slug: {
    separator: "-",
    lowercase: true,
    locale: "en"
  },

  parser: {
    html: false,
    breaks: false,
    linkify: false,
    typographer: false
  }
});
```

#### `locale`

Locale hint for text analysis. It is also used for slug generation unless
`slug.locale` is supplied.

#### `wordsPerMinute`

Reading-speed value passed to `open.text`. Defaults there to 225.

#### `headingIds`

Defaults to `true`.

When enabled, heading IDs are generated with
`@journey-to-code/open-slug`.

Duplicate headings receive deterministic suffixes:

```markdown
## Installation
## Installation
## Installation
```

becomes:

```text
installation
installation-2
installation-3
```

#### `headingIdPrefix`

Optional string prepended to generated heading IDs:

```js
analyzeDocument(source, {
  headingIdPrefix: "section-"
});
```

produces IDs such as:

```text
section-installation
```

#### `slug`

Options passed to `open.slug`.

#### `parser`

Options passed to `open.markdown-parser`.

## Heading ranges

When the underlying parser exposes line maps, headings include:

```js
{
  range: {
    startLine: 12,
    endLine: 12
  }
}
```

Line numbers are 1-based.

This is useful for future editor features such as:

- jump-to-heading,
- outline navigation,
- scroll synchronization,
- diagnostics.

If a source range is unavailable, `range` is omitted.

## Composition

`open.document` intentionally composes smaller packages:

```text
@journey-to-code/open-markdown-parser
@journey-to-code/open-slug
@journey-to-code/open-text
@journey-to-code/open-outline
                    │
                    ▼
       @journey-to-code/open-document
```

Responsibilities stay separate:

- `open-markdown-parser` identifies Markdown structures.
- `open-slug` creates stable heading identifiers.
- `open-text` provides text statistics and reading time.
- `open-outline` creates the heading hierarchy.
- `open-document` coordinates those tools into one document model.

## Scope

`open.document` deliberately does not:

- render HTML,
- sanitize HTML,
- syntax-highlight code,
- parse frontmatter,
- read or write files,
- manipulate the DOM,
- manage editor state,
- provide themes,
- publish content.

Those concerns belong in higher-level packages.

## Runtime

- Node.js 18+
- modern ESM-capable tooling

## Development

Install dependencies and run:

```bash
npm install
npm test
```

## License

MIT
