/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-related. Base: cards.
 * Source: https://wknd.site/ca/en/magazine/arctic-surfing.html
 * Generated: 2026-09-17
 *
 * Source: an image-less "up next / related stories" list in the sidebar
 * (.list.cmp-list--upnext). Each item (.cmp-list__item) is a link
 * (.cmp-list__item-link) containing a story title (.cmp-list__item-title)
 * and a date (.cmp-list__item-date).
 *
 * Library structure (Cards, no-images variant): 1 column, multiple rows.
 * First row = block name. Each subsequent row is one card with a single cell
 * holding text content (heading + description). Here each row = one related
 * item, single cell holding the linked title (as heading) and the date.
 * The cards-related decorate() wraps each row into a list item.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-list__item, li'));

  const cells = [];

  items.forEach((item) => {
    // Link wrapping the item (preserve href + title text).
    const itemLink = item.querySelector('a.cmp-list__item-link, .cmp-list__item-link, a');
    const titleText = item.querySelector('.cmp-list__item-title, [class*="title"]');
    const dateText = item.querySelector('.cmp-list__item-date, [class*="date"]');

    // Skip items with no meaningful content.
    if (!itemLink && !titleText && !dateText) return;

    const contentCell = [];

    // Linked title styled as a heading.
    const title = (titleText || itemLink);
    const label = title ? title.textContent.trim() : '';
    if (label) {
      const heading = document.createElement('h3');
      const href = itemLink && itemLink.getAttribute('href');
      if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = label;
        heading.appendChild(link);
      } else {
        heading.textContent = label;
      }
      contentCell.push(heading);
    }

    // Date as a paragraph below the heading.
    if (dateText && dateText.textContent.trim()) {
      const date = document.createElement('p');
      date.textContent = dateText.textContent.trim();
      contentCell.push(date);
    }

    if (!contentCell.length) return;

    // Single-column block: one row, one cell holding all elements.
    cells.push([contentCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-related', cells });
  element.replaceWith(block);
}
