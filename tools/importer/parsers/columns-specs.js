/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-specs. Base: columns.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Generated: 2026-09-17
 *
 * Library structure (Columns): first row = block name, subsequent rows contain
 * as many cells as columns. This variant is a specification list built from a
 * content-fragment <dl>: each spec becomes one 2-column row —
 * cell 1 = label (dt), cell 2 = value (dd). The columns-specs decorate() marks
 * the first cell of each row as the label and the second as the value.
 */
export default function parse(element, { document }) {
  // Each spec is a wrapper element holding a dt (title) and dd (value).
  let specs = Array.from(element.querySelectorAll('.cmp-contentfragment__element'));
  if (!specs.length) {
    // Fallback: pair raw dt/dd children if the wrapper class is absent.
    const dts = Array.from(element.querySelectorAll('dt'));
    specs = dts.map((dt) => {
      const wrapper = document.createElement('div');
      wrapper.appendChild(dt.cloneNode(true));
      const dd = dt.nextElementSibling;
      if (dd && dd.tagName === 'DD') wrapper.appendChild(dd.cloneNode(true));
      return wrapper;
    });
  }

  const cells = [];

  specs.forEach((spec) => {
    const label = spec.querySelector('.cmp-contentfragment__element-title, dt');
    const value = spec.querySelector('.cmp-contentfragment__element-value, dd');

    const labelText = label ? label.textContent.trim() : '';
    const valueText = value ? value.textContent.trim() : '';

    // Skip specs that have neither a label nor a value.
    if (!labelText && !valueText) return;

    cells.push([labelText, valueText]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-specs', cells });
  element.replaceWith(block);
}
