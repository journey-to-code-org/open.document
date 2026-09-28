import test from "node:test";
import assert from "node:assert/strict";

import { analyzeDocument } from "../src/index.js";

test("analyzes an empty document", () => {
  const result = analyzeDocument("");

  assert.equal(result.source, "");
  assert.equal(result.plainText, "");
  assert.deepEqual(result.headings, []);
  assert.deepEqual(result.outline, []);
  assert.deepEqual(result.links, []);
  assert.deepEqual(result.images, []);
  assert.deepEqual(result.codeBlocks, []);
  assert.equal(result.stats.words, 0);
});

test("composes headings, unique slugs, and outline structure", () => {
  const result = analyzeDocument(
    "# Guide\n\n## Install\n\n## Install\n\n### Windows"
  );

  assert.deepEqual(
    result.headings.map(({ level, text, id }) => ({ level, text, id })),
    [
      { level: 1, text: "Guide", id: "guide" },
      { level: 2, text: "Install", id: "install" },
      { level: 2, text: "Install", id: "install-2" },
      { level: 3, text: "Windows", id: "windows" }
    ]
  );

  assert.equal(result.outline.length, 1);
  assert.equal(result.outline[0].children.length, 2);
  assert.equal(result.outline[0].children[1].children[0].id, "windows");
});

test("adds one-based source line ranges to headings", () => {
  const result = analyzeDocument(
    "# Guide\n\nText\n\n## Install"
  );

  assert.deepEqual(result.headings[0].range, {
    startLine: 1,
    endLine: 1
  });

  assert.deepEqual(result.headings[1].range, {
    startLine: 5,
    endLine: 5
  });
});

test("supports heading prefixes", () => {
  const result = analyzeDocument("# Install", {
    headingIdPrefix: "section-"
  });

  assert.equal(result.headings[0].id, "section-install");
});

test("can disable heading IDs", () => {
  const result = analyzeDocument("# Install", {
    headingIds: false
  });

  assert.equal("id" in result.headings[0], false);
  assert.equal("id" in result.outline[0], false);
});

test("gives symbol-only headings deterministic section IDs", () => {
  const result = analyzeDocument(
    "# 🎉\n\n## 🎉"
  );

  assert.equal(result.headings[0].id, "section");
  assert.equal(result.headings[1].id, "section-2");
});

test("passes parser options through", () => {
  const result = analyzeDocument(
    "Visit https://example.com",
    {
      parser: { linkify: true }
    }
  );

  assert.equal(result.links.length, 1);
  assert.equal(result.links[0].href, "https://example.com");
});

test("returns links, images, and code blocks from the parser", () => {
  const result = analyzeDocument(`
# Example

[Docs](https://example.com)

![Diagram](/diagram.png)

\`\`\`js
console.log("hello");
\`\`\`
`);

  assert.equal(result.links[0].href, "https://example.com");
  assert.equal(result.images[0].src, "/diagram.png");
  assert.equal(result.codeBlocks[0].language, "js");
});

test("produces text statistics from parsed plain text", () => {
  const result = analyzeDocument(
    "# Hello\n\nThis is a document."
  );

  assert.ok(result.stats.words > 0);
  assert.ok(result.stats.characters > 0);
  assert.equal(result.stats.readingTime.words, result.stats.words);
});

test("supports custom reading speed", () => {
  const result = analyzeDocument(
    "one two three four",
    { wordsPerMinute: 2 }
  );

  assert.equal(result.stats.readingTime.wordsPerMinute, 2);
  assert.equal(result.stats.readingTime.minutes, 2);
});

test("passes locale into text and slug behavior", () => {
  const result = analyzeDocument(
    "# İSTANBUL",
    { locale: "tr" }
  );

  assert.equal(result.headings[0].id, "ıstanbul");
});

test("rejects invalid source", () => {
  assert.throws(() => analyzeDocument(null), TypeError);
  assert.throws(() => analyzeDocument(42), TypeError);
});

test("rejects invalid options", () => {
  assert.throws(() => analyzeDocument("# Hi", null), TypeError);
  assert.throws(
    () => analyzeDocument("# Hi", { headingIds: "yes" }),
    TypeError
  );
  assert.throws(
    () => analyzeDocument("# Hi", { headingIdPrefix: 42 }),
    TypeError
  );
});

test("rejects invalid nested option objects", () => {
  assert.throws(
    () => analyzeDocument("# Hi", { slug: null }),
    TypeError
  );

  assert.throws(
    () => analyzeDocument("# Hi", { parser: [] }),
    TypeError
  );
});
