/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://wknd.site/ca/en/faqs.html
 * Generated: 2026-09-17
 *
 * Library structure (Accordion): 2 columns, multiple rows. First row = block name.
 * Each subsequent row is one accordion item:
 *   cell 1 = the clickable title/question label
 *   cell 2 = the panel body content revealed when expanded
 * The accordion-faq decorate() reads row.children[0] as the summary label and
 * row.children[1] as the body.
 *
 * Source DOM (AEM Core Component accordion):
 *   .cmp-accordion > .cmp-accordion__item (one per Q&A)
 *     .cmp-accordion__header > button.cmp-accordion__button > span.cmp-accordion__title (question)
 *     .cmp-accordion__panel > ... > .cmp-text (answer paragraphs)
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'));

  const cells = [];

  items.forEach((item) => {
    // Question label: prefer the dedicated title span, then the header/button text.
    const titleEl = item.querySelector(
      '.cmp-accordion__title, [class*="title"], .cmp-accordion__button, .cmp-accordion__header',
    );
    const question = titleEl ? titleEl.textContent.trim() : '';

    // Answer body: the panel holds the content region. Extract the meaningful
    // text nodes (paragraphs, headings, lists) from the inner text component,
    // skipping empty AEM grid scaffolding.
    const panel = item.querySelector('.cmp-accordion__panel') || item;
    const source = panel.querySelector('.cmp-text, .cmp-container, .text') || panel;

    const bodyCell = [];
    source.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, img, picture, a').forEach((node) => {
      // Keep only top-level meaningful nodes: skip inline nodes (a/img/picture)
      // that live inside a block-level node we already capture.
      if (node.matches('a, img, picture')
        && node.closest('p, ul, ol, h1, h2, h3, h4, h5, h6')) {
        return;
      }
      // Skip empty headings/paragraphs (AEM often emits <h3>&nbsp;</h3> spacers).
      if (node.matches('p, h1, h2, h3, h4, h5, h6') && !node.textContent.trim()
        && !node.querySelector('img, picture, a')) {
        return;
      }
      bodyCell.push(node);
    });

    if (!bodyCell.length) {
      // Nothing meaningful extracted — fall back to the whole panel content region.
      bodyCell.push(source);
    }

    // Skip items with neither a question nor a body.
    if (!question && !bodyCell.length) return;

    cells.push([question, bodyCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
