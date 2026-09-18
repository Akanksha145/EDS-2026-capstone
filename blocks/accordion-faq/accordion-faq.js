/*
 * Accordion (FAQ) Block
 * Recreate an accordion of question/answer rows.
 * Based on https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label (question)
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body (answer)
    const body = row.children[1];
    body.className = 'accordion-faq-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
