/* eslint-disable */
/* global WebImporter, document */

/**
 * Transformer: article-template content-fragment cleanup.
 *
 * Two source artifacts must be removed before section breaks / block parsers run,
 * verified against https://wknd.site/us/en/magazine/arctic-surfing.html:
 *
 *  1. Leading hero image — a `.image` block that sits above the breadcrumb/title,
 *     outside the body <article> and NOT a `.byline` avatar (src e.g.
 *     surfer-back-from-the-ocean.jpeg). It duplicates a lead hero the source does
 *     not promote in reading order; left in place the sections transformer turns it
 *     into a lone leading "Lead Image" section. Body images live inside <article>
 *     and the author avatar carries the `byline` class — both are preserved.
 *
 *  2. Content-fragment title — a hidden `<h3 class="cmp-contentfragment__title">`
 *     (display:none in source) whose text duplicates the page <h1>. Emitted as a
 *     spurious <h3> at the top of the article body.
 *
 * Runs in beforeTransform so removals happen before wknd-sections inserts breaks.
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  // 1. Drop the duplicate leading hero image (not a body image, not the byline avatar).
  const leadImages = Array.from(element.querySelectorAll('.image:not(.byline)'))
    .filter((block) => !block.closest('article')
      && !block.closest('.contentfragment, .cmp-contentfragment'));
  leadImages.forEach((block) => block.remove());

  // 2. Strip content-fragment title(s) duplicating the H1.
  element.querySelectorAll('.cmp-contentfragment__title').forEach((t) => t.remove());
}
