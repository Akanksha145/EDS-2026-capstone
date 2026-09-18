/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-filter. Base: tabs.
 * Source: https://wknd.site/ca/en/adventures.html
 * Generated: 2026-09-17
 *
 * This block is a category filter bar built from an AEM tabs component
 * (.tabs.panelcontainer). Only the tab LABELS are the filter pills — the tab
 * panel content (the adventure card list) is handled by the SEPARATE
 * cards-article block, NOT this filter.
 *
 * The tabs-filter decorate() reads each row's first cell as a filter pill
 * label. So the block table is 1 column, one row per category label:
 *   Row 1 cell: All
 *   Row 2 cell: Climbing
 *   ... etc.
 *
 * Labels come from the tab list items (.cmp-tabs__tab / [role="tab"]).
 */
export default function parse(element, { document }) {
  // Tab labels live in the tablist. Prefer the AEM tab items; fall back to the
  // ARIA role and to plain list items inside a tablist for cross-page variation.
  let labels = Array.from(element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab'));
  if (!labels.length) {
    labels = Array.from(element.querySelectorAll('[role="tab"]'));
  }
  if (!labels.length) {
    labels = Array.from(element.querySelectorAll('.cmp-tabs__tablist > li, ol.cmp-tabs__tablist > li'));
  }

  const cells = [];
  labels.forEach((tab) => {
    const label = tab.textContent.trim();
    if (!label) return;
    // 1-column block: one row per category, single cell holds the label text.
    cells.push([label]);
  });

  if (!cells.length) {
    // No tab labels found — remove the empty scaffolding rather than emit an empty block.
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-filter', cells });

  // The tabs component NESTS one card grid (.image-list.list) per category tab
  // (All, Climbing, ...). The listing is INDEX-DRIVEN: cards-article reads
  // query-index.json and the filter bar narrows client-side, so we only need a
  // SINGLE grid — the first panel ("All", the full list). Lift just that one out
  // as a sibling after the filter bar; the per-category duplicate panels are
  // dropped (they would otherwise render as identical repeated index grids).
  const firstGrid = element.querySelector('.image-list.list');
  element.replaceWith(block);
  if (firstGrid) block.after(firstGrid);
}
