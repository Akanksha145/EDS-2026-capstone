import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  readBlockConfig,
  toClassName,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Applies section metadata as classes/data attributes on each section.
 * The vendored aem.js decorateSections() does not consume the
 * `.section-metadata` block, so process it here: read the config, set the
 * `style` values as classes on the section, other keys as data attributes,
 * then remove the metadata block.
 * @param {Element} main The container element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll(':scope > div.section').forEach((section) => {
    const sectionMeta = section.querySelector('div.section-metadata');
    if (!sectionMeta) return;
    const meta = readBlockConfig(sectionMeta);
    Object.keys(meta).forEach((key) => {
      if (key === 'style') {
        const styles = meta.style
          .split(',')
          .map((style) => toClassName(style.trim()))
          .filter((style) => style);
        styles.forEach((style) => section.classList.add(style));
      } else {
        section.dataset[toClassName(key)] = meta[key];
      }
    });
    sectionMeta.parentNode.remove();
  });
}

/**
 * Article pages (magazine stories) place the body prose and the "Share This
 * Story" + related-articles list as separate sibling sections. The source
 * renders these as a two-column layout: a 776px prose column on the left and a
 * ~291px rail on the right, top-aligned. The migrated sections arrive in
 * varying order across the 12 article pages, so classify each section by
 * content (not position) and wrap prose vs. rail into a CSS grid.
 *
 * Detected only on article pages (identified by a cards-related block). The
 * grid itself is styled in styles.css under `.article-layout`.
 * @param {Element} main The main element
 */
function decorateArticleLayout(main) {
  const relatedBlock = main.querySelector('.cards-related');
  if (!relatedBlock) return; // not an article page

  const sections = [...main.querySelectorAll(':scope > div.section')];
  if (sections.length < 2) return;

  // The first section (breadcrumb + H1 + byline + prose) stays full-width above
  // the two columns; everything from the "Share This Story" section onward is
  // the rail. Classify by content: a section is "rail" if it contains the
  // related-articles block, the SHARE heading, or the author social links.
  const relatedSection = relatedBlock.closest(':scope > div.section, div.section');
  const shareSection = sections.find((s) => [...s.querySelectorAll('h5')]
    .some((h) => /share this story/i.test(h.textContent || '')));

  const railSections = sections.filter((s) => s === relatedSection || s === shareSection);
  if (!railSections.length) return;

  // Prose = the body sections that are not rail and not the lead title section.
  // Keep the lead section (has the H1) full-width at the top.
  const leadSection = sections.find((s) => s.querySelector('h1'));
  const proseSections = sections.filter(
    (s) => !railSections.includes(s) && s !== leadSection,
  );
  if (!proseSections.length) return;

  // Build the two-column grid: [prose column][rail column].
  const grid = document.createElement('div');
  grid.className = 'article-layout';
  const proseCol = document.createElement('div');
  proseCol.className = 'article-layout-body';
  const railCol = document.createElement('div');
  railCol.className = 'article-layout-rail';

  // Position the grid directly after the lead (H1) section so the title/byline
  // always stays full-width above the two columns — the lead section's position
  // in document order varies across pages (sometimes last), so anchor to it
  // explicitly rather than to the first prose section.
  if (leadSection) {
    leadSection.after(grid);
  } else {
    proseSections[0].before(grid);
  }
  proseSections.forEach((s) => proseCol.append(s));
  railSections.forEach((s) => railCol.append(s));
  grid.append(proseCol, railCol);
}

/**
 * FAQ pages place the "Need more help?" follow-up in a right rail beside the
 * FAQ content column (source: content 748px at x=152, rail 291px at x=1011).
 * Unlike the article template these arrive as sibling *wrappers* inside one
 * `.accordion-faq` section, so wrap them into a two-column grid: left column =
 * everything except the help block (intro + accordion), right rail = the
 * trailing default-content block that leads with the "Need more help?" heading.
 *
 * Detected only on FAQ pages (identified by an accordion-faq block). Styled in
 * styles.css under `.faq-layout`.
 * @param {Element} main The main element
 */
function decorateFaqLayout(main) {
  const accordion = main.querySelector('.accordion-faq');
  if (!accordion) return; // not an FAQ page
  const section = accordion.closest('div.section');
  if (!section) return;

  const wrappers = [...section.children];
  // Rail = the default-content-wrapper that leads with the "Need more help?"
  // heading. Everything else stays in the left column.
  const railWrapper = wrappers.find((w) => {
    const h = w.querySelector('h2, h3, h4');
    return h && /need more help/i.test(h.textContent || '');
  });
  if (!railWrapper) return;

  // A divider-wrapper is only meaningful in a single-column stack; in the
  // two-column layout the rail separates itself, so drop it.
  wrappers.filter((w) => w.classList.contains('divider-wrapper')).forEach((w) => w.remove());

  const bodyWrappers = wrappers.filter(
    (w) => w !== railWrapper && !w.classList.contains('divider-wrapper'),
  );
  if (!bodyWrappers.length) return;

  const grid = document.createElement('div');
  grid.className = 'faq-layout';
  const bodyCol = document.createElement('div');
  bodyCol.className = 'faq-layout-body';
  const railCol = document.createElement('div');
  railCol.className = 'faq-layout-rail';

  bodyWrappers[0].before(grid);
  bodyWrappers.forEach((w) => bodyCol.append(w));
  railCol.append(railWrapper);
  grid.append(bodyCol, railCol);
}

/**
 * Strips the `.html` extension from internal links. The migrated WKND content
 * carries source-style links like `/us/en/adventures.html`, but EDS serves
 * pages at extensionless paths, so those links would 404. Rewrites in place;
 * leaves external links and non-page assets untouched.
 * @param {Element} main The main element
 */
function decorateLinks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    try {
      const url = new URL(href, window.location.href);
      // same-origin page links ending in .html -> drop the extension
      if (url.origin === window.location.origin && url.pathname.endsWith('.html')) {
        url.pathname = url.pathname.slice(0, -'.html'.length);
        a.setAttribute('href', url.pathname + url.search + url.hash);
      }
    } catch (e) {
      // ignore malformed hrefs (e.g. "#", "mailto:")
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionMetadata(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateLinks(main);
  decorateArticleLayout(main);
  decorateFaqLayout(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
