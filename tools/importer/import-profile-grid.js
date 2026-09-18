/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsProfileParser from './parsers/cards-profile.js';
import cardsArticleParser from './parsers/cards-article.js';
import columnsFeaturedParser from './parsers/columns-featured.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-profile': cardsProfileParser,
  'cards-article': cardsArticleParser,
  'columns-featured': columnsFeaturedParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'profile-grid',
  description: 'Profile/contributor grid page',
  urls: [
    'https://wknd.site/ca/en/about-us.html',
  ],
  blocks: [
    {
      name: 'columns-featured',
      instances: ['.teaser.cmp-teaser--featured'],
    },
    {
      name: 'cards-profile',
      instances: ['.buildingblock.cmp-buildingblock--btn-list'],
    },
    {
      name: 'cards-article',
      instances: ['.image-list.list'],
    },
  ],
  sections: [
    {
      id: 's1', name: 'Page Title', selector: ['.title.cmp-title--black', 'main .title:first-of-type'], style: null, blocks: [], defaultContent: ['main h1', '.title.cmp-title--black'],
    },
    {
      id: 's2', name: 'Our Contributors', selector: ['.title.cmp-title--underline', '.cmp-container .aem-Grid'], style: null, blocks: ['cards-profile'], defaultContent: ['.title.cmp-title--underline', '.text.cmp-text--font-small'],
    },
    {
      id: 's3', name: 'WKND Guides', selector: ['.title.cmp-title--underline', '.cmp-container .aem-Grid'], style: null, blocks: ['cards-profile'], defaultContent: ['.title.cmp-title--underline', '.text.cmp-text--font-small'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, section transformer after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Merge consecutive sibling blocks of the same name (matched by the block's
 * first-row block-name cell) into a single block, appending each subsequent
 * block's card rows. Only merges blocks that are adjacent among element
 * siblings (ignoring whitespace text nodes), so a heading/paragraph between
 * groups keeps them as separate blocks.
 */
function mergeAdjacentBlocks(document, main, blockName) {
  // helix-importer createTable appends <tr> rows directly to <table> (no tbody);
  // the first row is the block-name header (<th>).
  const isBlock = (el) => el
    && el.nodeType === 1
    && el.tagName === 'TABLE'
    && (el.querySelector('th, td')?.textContent || '').trim().toLowerCase() === blockName;

  const blocks = [...main.querySelectorAll('table')].filter(isBlock);
  const consumed = new Set();

  blocks.forEach((first) => {
    if (consumed.has(first) || !first.parentNode) return;
    let next = first.nextElementSibling;
    while (isBlock(next)) {
      // append this block's data rows (all <tr> after its header row) to `first`
      const rows = [...next.children].filter((c) => c.tagName === 'TR');
      rows.slice(1).forEach((row) => first.appendChild(row));
      consumed.add(next);
      const toRemove = next;
      next = next.nextElementSibling;
      toRemove.remove();
    }
  });
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    // Merge adjacent cards-profile blocks into one multi-card block so
    // contributors form a grid row (source layout) instead of stacking as
    // separate single-card blocks. A non-cards-profile element between two
    // blocks (e.g. the "WKND Guides" heading) breaks the run, so the two
    // groups stay separate — matching the source's two grids.
    mergeAdjacentBlocks(document, main, 'cards-profile');

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
