import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment. Resolve /content first (localhost / aem up),
  // then root (DA/EDS production) so the WKND fragment is preferred over any
  // proxied default at the root path.
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(`/content${footerPath}`) || await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Fragment image paths are relative to the fragment location, not the current
  // page. Rewrite them so the WKND logo resolves regardless of page depth:
  // /content first (localhost / aem up), then root (DA/EDS prod) as a fallback.
  footer.querySelectorAll('img[src]').forEach((img) => {
    const raw = img.getAttribute('src');
    if (raw && !/^(https?:)?\/\//.test(raw) && !raw.startsWith('/')) {
      const rel = raw.replace(/^\.?\//, '');
      img.src = `/content/${rel}`;
      img.addEventListener('error', () => { img.src = `/${rel}`; }, { once: true });
    }
  });

  // Tag the fragment sections in order so CSS can target them:
  // [0] brand logo, [1] nav links, [2] Follow Us + social, [3] legal/copyright.
  const parts = ['footer-brand', 'footer-nav', 'footer-social', 'footer-legal'];
  [...footer.children].forEach((section, i) => {
    if (parts[i]) section.classList.add(parts[i]);
  });

  block.append(footer);
}
