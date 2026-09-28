import type {
  MarkdownCodeBlock,
  MarkdownImage,
  MarkdownLink,
  MarkdownToken,
  ParseMarkdownOptions
} from "@journey-to-code/open-markdown-parser";

export interface SlugOptions {
  separator?: string;
  lowercase?: boolean;
  locale?: string | string[];
}

export interface AnalyzeDocumentOptions {
  locale?: string;
  wordsPerMinute?: number;
  headingIds?: boolean;
  headingIdPrefix?: string;
  slug?: SlugOptions;
  parser?: ParseMarkdownOptions;
}

export interface SourceRange {
  startLine: number;
  endLine: number;
}

export interface DocumentHeading {
  level: number;
  text: string;
  id?: string;
  range?: SourceRange;
}

export interface DocumentOutlineItem extends DocumentHeading {
  children: DocumentOutlineItem[];
}

export interface ReadingTimeResult {
  words: number;
  minutes: number;
  roundedMinutes: number;
  wordsPerMinute: number;
}

export interface DocumentStats {
  words: number;
  characters: number;
  charactersWithoutWhitespace: number;
  sentences: number;
  paragraphs: number;
  readingTime: ReadingTimeResult;
}

export interface AnalyzedDocument {
  source: string;
  plainText: string;
  headings: DocumentHeading[];
  outline: DocumentOutlineItem[];
  links: MarkdownLink[];
  images: MarkdownImage[];
  codeBlocks: MarkdownCodeBlock[];
  stats: DocumentStats;
  tokens: MarkdownToken[];
}

export function analyzeDocument(
  source: string,
  options?: AnalyzeDocumentOptions
): AnalyzedDocument;
