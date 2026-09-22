/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base: columns.
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-17
 *
 * Library structure (Columns): first row = block name, subsequent rows contain
 * as many cells as columns. Source is a featured teaser laid out as two columns:
 * cell 1 = image, cell 2 = text content (eyebrow/pretitle, heading, description, CTA).
 */
export default function parse(element, { document }) {
  // Image column.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Text column.
  const content = element.querySelector('.cmp-teaser__content') || element;
  const eyebrow = content.querySelector('.cmp-teaser__pretitle, [class*="pretitle"], [class*="eyebrow"]');
  // Exclude pretitle/eyebrow from the heading match — "pretitle" contains the
  // substring "title", so a bare [class*="title"] would grab the eyebrow.
  const heading = content.querySelector('h1, h2, h3, .cmp-teaser__title, [class*="title"]:not([class*="pretitle"]):not([class*="eyebrow"])');
  const description = content.querySelector('.cmp-teaser__description, [class*="description"], p:not([class*="pretitle"])');
  const ctaLinks = Array.from(
    content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a'),
  );

  if (!heading && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const textCell = [];
  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  textCell.push(...ctaLinks);

  const cells = [[image || '', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
