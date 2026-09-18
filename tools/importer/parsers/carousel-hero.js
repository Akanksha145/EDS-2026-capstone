/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-17
 *
 * Library structure (Carousel): 2 columns, multiple rows. First row = block name.
 * Each subsequent row is one slide: cell 1 = image (mandatory), cell 2 = text content
 * (title as heading, description, CTA link).
 *
 * Handles both the home hero carousel (.cmp-carousel--hero, multi-slide teasers)
 * and the adventure-detail mini hero (.cmp-carousel--mini, a single image slide
 * with no teaser text — content cell is emitted empty).
 */
export default function parse(element, { document }) {
  // Each carousel item wraps a teaser. Fall back to teasers directly if the
  // item wrappers are absent on some pages.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.teaser, .cmp-teaser'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image (mandatory) — first cell.
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Text content (optional) — second cell.
    const content = slide.querySelector('.cmp-teaser__content') || slide;
    const heading = content.querySelector('h1, h2, h3, .cmp-teaser__title, [class*="title"]');
    const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');
    const ctaLinks = Array.from(
      content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a'),
    );

    // Skip slides with neither an image nor any text — avoids empty rows.
    if (!image && !heading && !description && !ctaLinks.length) return;

    const textCell = [];
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    textCell.push(...ctaLinks);

    cells.push([image || '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
