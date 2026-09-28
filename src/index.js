import { parseMarkdown } from "@journey-to-code/open-markdown-parser";
import { buildOutline } from "@journey-to-code/open-outline";
import { createUniqueSlug } from "@journey-to-code/open-slug";
import { analyzeText } from "@journey-to-code/open-text";

/**
 * Analyze Markdown source into one normalized document model.
 *
 * @param {string} source
 * @param {{
 *   locale?: string,
 *   wordsPerMinute?: number,
 *   headingIds?: boolean,
 *   headingIdPrefix?: string,
 *   slug?: {
 *     separator?: string,
 *     lowercase?: boolean,
 *     locale?: string | string[]
 *   },
 *   parser?: {
 *     html?: boolean,
 *     breaks?: boolean,
 *     linkify?: boolean,
 *     typographer?: boolean
 *   }
 * }} [options]
 * @returns {object}
 */
export function analyzeDocument(source, options = {}) {
  if (typeof source !== "string") {
    throw new TypeError("Expected source to be a string");
  }

  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Expected options to be an object");
  }

  const {
    locale,
    wordsPerMinute,
    headingIds = true,
    headingIdPrefix = "",
    slug = {},
    parser = {}
  } = options;

  if (locale !== undefined && typeof locale !== "string") {
    throw new TypeError("Expected locale to be a string");
  }

  if (typeof headingIds !== "boolean") {
    throw new TypeError("Expected headingIds to be a boolean");
  }

  if (typeof headingIdPrefix !== "string") {
    throw new TypeError("Expected headingIdPrefix to be a string");
  }

  if (slug === null || typeof slug !== "object" || Array.isArray(slug)) {
    throw new TypeError("Expected slug to be an object");
  }

  if (parser === null || typeof parser !== "object" || Array.isArray(parser)) {
    throw new TypeError("Expected parser to be an object");
  }

  const parsed = parseMarkdown(source, parser);
  const ranges = collectHeadingRanges(parsed.tokens);
  const usedSlugs = new Set();

  const slugOptions = {
    ...slug,
    ...(slug.locale === undefined && locale !== undefined
      ? { locale }
      : {})
  };

  const headings = parsed.headings.map((heading, index) => {
    const result = { ...heading };

    if (headingIds) {
      let unique = createUniqueSlug(heading.text, usedSlugs, slugOptions);

      // Some headings can contain no slug-compatible letters/numbers.
      // Give them a deterministic usable ID instead of an empty identifier.
      if (unique === "") {
        unique = createUniqueSlug("section", usedSlugs, slugOptions);
      }

      usedSlugs.add(unique);
      result.id = `${headingIdPrefix}${unique}`;
    }

    const range = ranges[index];
    if (range) {
      result.range = range;
    }

    return result;
  });

  const textOptions = {};

  if (locale !== undefined) {
    textOptions.locale = locale;
  }

  if (wordsPerMinute !== undefined) {
    textOptions.wordsPerMinute = wordsPerMinute;
  }

  return {
    source,
    plainText: parsed.plainText,
    headings,
    outline: buildOutline(headings),
    links: parsed.links.map((link) => ({ ...link })),
    images: parsed.images.map((image) => ({ ...image })),
    codeBlocks: parsed.codeBlocks.map((block) => ({ ...block })),
    stats: analyzeText(parsed.plainText, textOptions),
    tokens: parsed.tokens
  };
}

function collectHeadingRanges(tokens) {
  const ranges = [];

  for (const token of tokens) {
    if (
      token.type !== "heading_open" ||
      !Array.isArray(token.map) ||
      token.map.length !== 2
    ) {
      continue;
    }

    const [start, end] = token.map;

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      continue;
    }

    ranges.push({
      startLine: start + 1,
      endLine: Math.max(start + 1, end)
    });
  }

  return ranges;
}
