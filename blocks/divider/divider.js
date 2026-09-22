/**
 * Divider block — renders a horizontal rule between content.
 *
 * Why a block (not a bare <hr>): in EDS a literal `<hr>` written into page
 * content is consumed by decorateSections() as a SECTION BOUNDARY (it splits
 * the page into separate sections) rather than rendering a visible line. A
 * block sidesteps that: authors insert a one-cell `divider` block and it draws
 * a rule in place, with no section-splitting side effect.
 *
 * Variants (add as a class in the block name, e.g. "divider (accent)"):
 *   default  — full-width 1px light hairline (#ebebeb), matches the site's
 *              FAQ / members-only separators
 *   accent   — short WKND-yellow rule (like the section-title underline)
 *   spacing  — invisible; adds vertical whitespace only
 *
 * @param {Element} block The divider block element
 */
export default function decorate(block) {
  // The block may carry authored cells; a divider has no content, so clear it
  // and render a semantic <hr>. Role/aria keep it a separator for a11y.
  block.textContent = '';
  const hr = document.createElement('hr');
  hr.className = 'divider-rule';
  block.append(hr);
}
