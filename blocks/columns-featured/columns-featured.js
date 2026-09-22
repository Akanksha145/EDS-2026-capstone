// Generic CTA labels that carry no destination context on their own. These need
// a descriptive accessible name so the link is meaningful out of context (a11y
// "link-text"). We keep the visible text as-is and add an aria-label instead.
const GENERIC_LINK_TEXT = /^(read|learn|find out|discover|see)\s+more$/i;

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-featured-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-featured-img-col');
        }
      }

      // Give generic CTA links (e.g. "Read More") a descriptive accessible name
      // derived from the teaser heading in the same column, so the visible text
      // stays on-design while screen readers / audits get context.
      const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const title = heading.textContent.trim();
        col.querySelectorAll('a').forEach((a) => {
          if (!a.hasAttribute('aria-label') && GENERIC_LINK_TEXT.test(a.textContent.trim())) {
            a.setAttribute('aria-label', `${a.textContent.trim()} about ${title}`);
          }
        });
      }
    });
  });
}
