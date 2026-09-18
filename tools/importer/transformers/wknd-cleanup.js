/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 * Removes non-authorable site chrome (header/nav/search, footer, mobile nav,
 * tracking iframe) and stray elements. All selectors verified against
 * migration-work/cleaned.html for https://wknd.site/us/en.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Tracking / third-party iframe (Adobe ID sync via demdex) — cleaned.html line 566
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      'iframe',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome verified in cleaned.html:
    //  - header.cmp-experiencefragment--header (line 5): sign-in, language nav, main nav, search
    //  - footer.cmp-experiencefragment--footer (line 471)
    //  - #toggleNav mobile menu toggle (line 568) and #mobileNav (line 574)
    WebImporter.DOMUtils.remove(element, [
      'header.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
      '#toggleNav',
      '#mobileNav',
    ]);

    // Stray empty <meta> tags nested inside cmp-image blocks (lines 183, 204, 227, 271, 334, 378)
    // and any leftover <link>/<noscript> — none are authorable content.
    WebImporter.DOMUtils.remove(element, ['meta', 'link', 'noscript']);
  }
}
