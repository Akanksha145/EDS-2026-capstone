import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment. If a `footer` metadata override is set, use it.
  // Otherwise resolve locale-aware: a per-site footer (/{cc}/{ll}/footer, e.g.
  // the Canada-specific footer) with a global /footer fallback. Root first
  // (DA/EDS prod + aem up both serve it), /content as a fallback.
  const footerMeta = getMetadata('footer');
  let fragment = null;
  if (footerMeta) {
    const p = new URL(footerMeta, window.location).pathname;
    fragment = await loadFragment(p) || await loadFragment(`/content${p}`);
  } else {
    const m = window.location.pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
    const loc = m ? `/${m[1]}/${m[2]}` : '';
    const paths = [];
    if (loc) paths.push(`${loc}/footer`);
    paths.push('/footer');
    for (let i = 0; i < paths.length && !fragment; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      fragment = await loadFragment(paths[i]) || await loadFragment(`/content${paths[i]}`);
    }
  }

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Fragment image paths are relative to the fragment location, not the current
  // page. Rewrite them so the WKND logo resolves regardless of page depth:
  // Root first (DA/EDS prod + aem up both serve it), /content as a fallback.
  footer.querySelectorAll('img[src]').forEach((img) => {
    const raw = img.getAttribute('src');
    if (raw && !/^(https?:)?\/\//.test(raw) && !raw.startsWith('/')) {
      const rel = raw.replace(/^\.?\//, '');
      img.src = `/${rel}`;
      img.addEventListener('error', () => { img.src = `/content/${rel}`; }, { once: true });
    }
  });

  // Tag the fragment sections by content (not position) so both the full
  // footer (brand + nav + social + legal) and the coming-soon stub footer
  // (brand + social + legal, no nav) tag correctly:
  //  - social: the "Follow Us" section (has an <h4>)
  //  - brand:  the logo section (has an <img>)
  //  - nav:    a bare link list (a <ul>, no <h4>)
  //  - legal:  everything else (copyright text)
  [...footer.children].forEach((section) => {
    if (section.querySelector('h4')) section.classList.add('footer-social');
    else if (section.querySelector('img')) section.classList.add('footer-brand');
    else if (section.querySelector('ul')) section.classList.add('footer-nav');
    else section.classList.add('footer-legal');
  });

  block.append(footer);
}
