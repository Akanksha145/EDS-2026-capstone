/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import tabsFilterParser from './parsers/tabs-filter.js';
import cardsArticleParser from './parsers/cards-article.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'tabs-filter': tabsFilterParser,
  'cards-article': cardsArticleParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'listing-filtered',
  description: 'Filterable listing page',
  urls: [
    'https://wknd.site/ca/en/adventures.html',
  ],
  blocks: [
    { name: 'hero-banner', instances: ['.teaser.cmp-teaser--hero', '.teaser.cmp-teaser--imagebottom'] },
    { name: 'tabs-filter', instances: ['.tabs.panelcontainer'] },
    { name: 'cards-article', instances: ['.image-list.list'] },
  ],
  sections: [
    {
      id: 's1', name: 'Page Title', selector: ['.title.cmp-title--black', 'main .title:first-of-type'], style: null, blocks: [], defaultContent: ['main h1'],
    },
    {
      id: 's2', name: 'Hero Banner', selector: ['.teaser.cmp-teaser--hero', '.teaser'], style: null, blocks: ['hero-banner'], defaultContent: [],
    },
    {
      id: 's3', name: 'Current Adventures', selector: ['.tabs.panelcontainer', '.image-list.list'], style: null, blocks: ['tabs-filter', 'cards-article'], defaultContent: ['.title.cmp-title--underline'],
    },
  ],
};

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

    // Source shows a visible hairline at the end of the page, just before the
    // footer. Append a divider block (renders the rule) as the last content of
    // main. It goes before the trailing section-marker <hr> below.
    const endDivider = WebImporter.Blocks.createBlock(document, { name: 'Divider', cells: {} });
    main.appendChild(endDivider);

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
