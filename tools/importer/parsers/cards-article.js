/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article — INDEX-DRIVEN.
 * Base: cards. Source: https://wknd.site/*
 *
 * Every listing surface must read query-index.json. Instead of extracting static
 * card markup, this parser emits an index-config cards-article block:
 *
 *   | cards-article |
 *   | Source | <path-prefix> |
 *   | Limit  | <n>           |
 *
 * The cards-article block JS (decorateFromIndex) fetches /query-index.json,
 * filters by Source path prefix, sorts, limits, and renders cards at runtime.
 *
 * The correct Source is chosen from the PAGE PATH and, on the homepage, from the
 * rail's nearest preceding heading (Recent Articles -> magazine, Where do you
 * want to go -> adventures).
 */
export default function parse(element, { document, url }) {
  // Locale root, e.g. /us/en or /ca/en — derived from the page path.
  let localeRoot = '/us/en';
  let pathname = '';
  try {
    pathname = new URL(url).pathname;
    const m = pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|\.|$)/);
    if (m) localeRoot = `/${m[1]}/${m[2]}`;
  } catch (e) { /* keep default */ }

  let source;
  let limit = '';

  if (/\/adventures(\.|\/|$)/.test(pathname)) {
    source = `${localeRoot}/adventures/`;
  } else if (/\/magazine(\.|\/|$)/.test(pathname)) {
    source = `${localeRoot}/magazine/`;
  } else {
    // Homepage rail — pick source by the nearest preceding heading.
    let heading = '';
    let n = element.previousElementSibling;
    while (n && !heading) {
      const h = (n.matches && n.matches('h1,h2,h3,h4,h5,h6'))
        ? n
        : (n.querySelector && n.querySelector('h1,h2,h3,h4,h5,h6'));
      if (h) heading = h.textContent.trim().toLowerCase();
      n = n.previousElementSibling;
    }
    if (heading.includes('where') || heading.includes('adventure') || heading.includes('trip') || heading.includes('go')) {
      source = `${localeRoot}/adventures/`;
    } else {
      source = `${localeRoot}/magazine/`;
    }
    limit = '4';
  }

  const cells = [['Source', source]];
  if (limit) cells.push(['Limit', limit]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
