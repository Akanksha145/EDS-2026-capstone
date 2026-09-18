// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Metadata-independent dual-fetch:
 * /content first (localhost / aem up), then root (DA/EDS production).
 */
async function fetchNavHtml() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return '';
  return resp.text();
}

/**
 * Toggle the mobile menu open/closed.
 * @param {Element} nav
 * @param {boolean|null} forceExpanded
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
}

/**
 * Builds the search form (form controls belong in JS, not the fragment).
 * @returns {Element}
 */
function buildSearch() {
  const search = document.createElement('div');
  search.className = 'nav-search';
  const form = document.createElement('form');
  form.setAttribute('role', 'search');
  form.action = '/us/en/search';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');
  form.append(input);
  search.append(form);
  return search;
}

/**
 * Map a locale link href (e.g. /ca/fr) to its country-flag SVG. The first path
 * segment is the country code; the source shows this flag beside the locale.
 * @param {string} href
 * @returns {string} flag asset path, or '' if unknown
 */
function flagFor(href) {
  const seg = (href || '').replace(/^\//, '').split('/')[0].toUpperCase();
  const known = { US: 'US', CA: 'CA', CH: 'CH', DE: 'DE', FR: 'FR', ES: 'ES', IT: 'IT' };
  return known[seg] ? `/icons/flags/${known[seg]}.svg` : '';
}

/**
 * Turns the locale link list into a click-toggle dropdown.
 * @param {Element} localeList the <ul> of locale links
 */
function decorateLocale(localeList) {
  if (!localeList) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-locale';

  const current = [...localeList.querySelectorAll('a')]
    .find((a) => a.getAttribute('href') === window.location.pathname)
    || localeList.querySelector('a');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-locale-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = current ? current.textContent.trim() : 'Language';
  // Country flag for the current locale (source shows the flag before the code).
  const currentFlag = current ? flagFor(current.getAttribute('href')) : '';
  if (currentFlag) toggle.style.backgroundImage = `url('${currentFlag}')`;

  localeList.classList.add('nav-locale-list');
  localeList.setAttribute('aria-hidden', 'true');
  // Flag on each dropdown option too.
  localeList.querySelectorAll('a').forEach((a) => {
    const flag = flagFor(a.getAttribute('href'));
    if (flag) {
      a.classList.add('nav-locale-flag');
      a.style.backgroundImage = `url('${flag}')`;
    }
  });

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    localeList.setAttribute('aria-hidden', open ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      localeList.setAttribute('aria-hidden', 'true');
    }
  });

  wrapper.append(toggle, localeList);
  return wrapper;
}

/**
 * loads and decorates the header nav.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const html = await fetchNavHtml();
  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Fragment image paths are relative to the nav fragment location, not the
  // current page. Rewrite them so they resolve regardless of page depth.
  // /content first (localhost / aem up), then root (DA/EDS prod) as a fallback.
  nav.querySelectorAll('img[src]').forEach((img) => {
    const raw = img.getAttribute('src');
    if (raw && !/^(https?:)?\/\//.test(raw) && !raw.startsWith('/')) {
      const rel = raw.replace(/^\.?\//, '');
      img.src = `/content/${rel}`;
      img.addEventListener('error', () => { img.src = `/${rel}`; }, { once: true });
    }
  });

  // The fragment sections, in order: [0] utility (sign-in + locale), [1] brand, [2] sections
  const classes = ['utility', 'brand', 'sections'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // --- Utility bar: sign-in link + locale dropdown ---
  const navUtility = nav.querySelector('.nav-utility');
  if (navUtility) {
    const localeList = navUtility.querySelector('ul');
    const locale = decorateLocale(localeList);
    if (locale) navUtility.append(locale);
  }

  // --- Tools: search form (built in JS) ---
  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';
  navTools.append(buildSearch());

  // --- Hamburger for mobile ---
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));

  // Assemble: hamburger + brand + sections + tools in the main bar
  const navBrand = nav.querySelector('.nav-brand');
  const navSections = nav.querySelector('.nav-sections');
  // Expose the top-level nav list/items so they are recognised as nav triggers.
  if (navSections) {
    const sectionsList = navSections.querySelector('ul');
    if (sectionsList) sectionsList.classList.add('nav-list');
    // Mark the nav item matching the current page so it gets the active
    // (yellow) highlight, matching the source's selected-state behavior.
    const here = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
    navSections.querySelectorAll(':scope > ul > li > a').forEach((a) => {
      a.classList.add('nav-trigger');
      const href = (a.getAttribute('href') || '').replace(/\.html$/, '').replace(/\/$/, '');
      // active when the current path is (or is under) this section, but not
      // for the Home link, which would otherwise match every page.
      if (href && here && href !== '/us/en' && (here === href || here.startsWith(`${href}/`))) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }
  const mainBar = document.createElement('div');
  mainBar.className = 'nav-main';
  mainBar.append(hamburger);
  if (navBrand) mainBar.append(navBrand);
  if (navSections) mainBar.append(navSections);
  mainBar.append(navTools);
  nav.append(mainBar);

  nav.setAttribute('aria-expanded', 'false');

  // Reset mobile state when crossing to desktop, and close menus.
  const onViewportChange = () => {
    if (isDesktop.matches) {
      nav.setAttribute('aria-expanded', 'false');
      document.body.style.overflowY = '';
    }
  };
  isDesktop.addEventListener('change', onViewportChange);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
