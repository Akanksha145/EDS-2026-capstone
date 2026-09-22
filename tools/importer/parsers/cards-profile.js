/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-profile. Base: cards.
 * Source: https://wknd.site/us/en/about-us.html (profile-grid template)
 * Generated: 2026-09-17
 *
 * Library convention (Cards): 2 columns, one row per card. First row = block name.
 * Each card row: cell 1 = image (circular avatar, mandatory), cell 2 = text content
 * (name as Heading h3, role/subtitle as h5, then the social-media icon links as CTAs).
 *
 * Selector matches `.buildingblock.cmp-buildingblock--btn-list` — the social-links
 * block INSIDE each person's card. There is one such element per person (no single
 * grid container), so the parser runs once per person and emits ONE card row. The
 * avatar/name/role live as siblings of this element within the enclosing card
 * container, so we walk up to the card root to extract them.
 */
export default function parse(element, { document }) {
  // Card root: the experience-fragment wrapper for this person, falling back to the
  // element's parent container if the wrapper class isn't present.
  const card = element.closest('.cmp-experiencefragment, .experiencefragment')
    || element.parentElement
    || element;

  // Avatar image (mandatory) — first cell.
  const image = card.querySelector('.cmp-image__image, .cmp-image img, .image img, img');

  // Name (h3) and role/subtitle (h5) live in .cmp-title blocks that are siblings of
  // the button list. Query by tag for resilience across pages.
  const name = card.querySelector('h3.cmp-title__text, h3')
    || card.querySelector('h2, h4');
  const role = card.querySelector('h5.cmp-title__text, h5')
    || card.querySelector('h6');

  // Social-media icon links live inside the matched button-list element itself.
  const socialLinks = Array.from(element.querySelectorAll('a[href]'));

  // Bail gracefully if this card has no meaningful content.
  if (!image && !name && !socialLinks.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const bodyCell = [];

  if (name) {
    const heading = document.createElement('h3');
    heading.textContent = name.textContent.trim();
    bodyCell.push(heading);
  }

  if (role) {
    const subheading = document.createElement('h5');
    subheading.textContent = role.textContent.trim();
    bodyCell.push(subheading);
  }

  // Rebuild clean anchors: label from the button text span (falling back to the
  // anchor's own text), preserving the original href.
  socialLinks.forEach((a) => {
    const href = a.getAttribute('href');
    const labelSource = a.querySelector('.cmp-button__text') || a;
    const label = labelSource.textContent.trim();
    if (!href && !label) return;
    const link = document.createElement('a');
    if (href) link.setAttribute('href', href);
    link.textContent = label;
    bodyCell.push(link);
  });

  const cells = [[image || '', bodyCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });
  // Replace the whole per-person card root (not just the matched button-list), so the
  // person's name/role/avatar siblings are consumed rather than left behind as
  // duplicate default content. Fall back to the matched element if no card root.
  const replaceTarget = (card && card !== element && card.contains(element)) ? card : element;
  replaceTarget.replaceWith(block);
}
