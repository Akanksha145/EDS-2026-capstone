/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-17
 *
 * Library structure (Hero): 1 column, 3 rows. Row 1 = block name.
 * Row 2 (single cell) = background image. Row 3 (single cell) = title (heading),
 * subheading/description, CTA link.
 */
export default function parse(element, { document }) {
  // Background image.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Text content.
  const content = element.querySelector('.cmp-teaser__content') || element;
  const heading = content.querySelector('h1, h2, h3, .cmp-teaser__title, [class*="title"]:not([class*="pretitle"])');
  const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');
  const ctaLinks = Array.from(
    content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a'),
  );

  if (!heading && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (single cell).
  if (image) cells.push([image]);

  // Row 3: text content (single cell holding all elements).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
