/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-detail. Base: tabs.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Generated: 2026-09-17
 *
 * Library structure (Tabs): 2 columns, multiple rows. First row = block name.
 * Each subsequent row is one tab: cell 1 = tab label, cell 2 = tab panel content
 * (paragraphs, images, lists, links). The tabs-detail decorate() reads the first
 * cell of each row as the tab label and turns the rest of the row into the panel.
 */
export default function parse(element, { document }) {
  // Tab labels live in the tablist; panels are the tabpanel containers.
  const labels = Array.from(element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, [role="tab"]'));
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel, [role="tabpanel"]'));

  const cells = [];

  panels.forEach((panel, i) => {
    // Label text — fall back to a generic label if the tablist is misaligned.
    const label = labels[i] ? labels[i].textContent.trim() : `Tab ${i + 1}`;

    // Panel content — extract the meaningful nodes inside the content fragment,
    // skipping the empty AEM grid scaffolding divs.
    const source = panel.querySelector('.cmp-contentfragment__elements, .cmp-contentfragment, .contentfragment') || panel;
    const contentCell = [];
    source.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, img, a, picture').forEach((node) => {
      // Only keep top-level meaningful nodes: skip nodes nested inside another
      // node we will already capture (e.g. an <a> inside a captured <p>).
      if (node.closest('p, ul, ol, h1, h2, h3, h4, h5, h6') !== node
        && node.matches('a, img, picture')
        && node.closest('p, ul, ol, h1, h2, h3, h4, h5, h6')) {
        return;
      }
      // Skip nodes that live inside another node already in our set.
      if (node.parentElement
        && node.parentElement.closest('p, ul, ol, h1, h2, h3, h4, h5, h6') && node.matches('a, img, picture')) {
        return;
      }
      contentCell.push(node);
    });

    if (!contentCell.length) {
      // Nothing meaningful found — fall back to the whole panel content.
      cells.push([label, source]);
      return;
    }

    cells.push([label, contentCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-detail', cells });
  element.replaceWith(block);
}
