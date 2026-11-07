import sanitizeHtml from 'sanitize-html';

/**
 * Post bodies come from the rich text editor, but Server Actions accept any
 * POST, so the HTML is cleaned to the editor's vocabulary before it is stored.
 */
const CONTENT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['class'],
    ol: ['start'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener noreferrer nofollow' } : attribs,
    }),
  },
};

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, CONTENT_OPTIONS)
    .trim()
    .replace(/(?:<p>\s*(?:<br \/>)?\s*<\/p>\s*)+$/, '');
}

/** Strips every tag, for plain-text fields such as excerpts. */
export function toPlainText(html: string): string {
  // Keep a gap where block elements end, so "<h2>A</h2><p>B</p>" reads "A B", not "AB".
  const spaced = html.replace(/<\/(?:p|h[1-6]|li|blockquote|pre|figcaption|div)>|<br\s*\/?>/gi, '$& ');
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
}
