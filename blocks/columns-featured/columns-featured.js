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

      // Give generic CTA links (e.g. "Read More") descriptive text derived from
      // the teaser heading in the same column. Appended as a visually-hidden
      // span so the visible text stays on-design ("Read More"), while the link's
      // accessible name — and its innerText, which SEO/link-text audits read —
      // becomes "Read More about {title}". A bare aria-label is insufficient
      // here: the link-text audit inspects innerText only and ignores it.
      const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const title = heading.textContent.trim();
        col.querySelectorAll('a').forEach((a) => {
          if (!a.querySelector('.sr-only') && GENERIC_LINK_TEXT.test(a.textContent.trim())) {
            const sr = document.createElement('span');
            sr.className = 'sr-only';
            sr.textContent = ` about ${title}`;
            a.append(sr);
          }
        });
      }
    });
  });
}
