import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment. If a `footer` metadata override is set, use it.
  // Otherwise resolve locale-aware: a per-site footer (/{cc}/{ll}/footer, e.g.
  // the Canada-specific footer) with a global /footer fallback. /content first
  // for localhost/aem-up, then root for DA/EDS production.
  const footerMeta = getMetadata('footer');
  let fragment = null;
  if (footerMeta) {
    const p = new URL(footerMeta, window.location).pathname;
    fragment = await loadFragment(`/content${p}`) || await loadFragment(p);
  } else {
    const m = window.location.pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
    const loc = m ? `/${m[1]}/${m[2]}` : '';
    const paths = [];
    if (loc) paths.push(`${loc}/footer`);
    paths.push('/footer');
    for (let i = 0; i < paths.length && !fragment; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      fragment = await loadFragment(`/content${paths[i]}`) || await loadFragment(paths[i]);
    }
  }

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
