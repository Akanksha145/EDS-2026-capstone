/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsSpecsParser from './parsers/columns-specs.js';
import tabsDetailParser from './parsers/tabs-detail.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'columns-specs': columnsSpecsParser,
  'tabs-detail': tabsDetailParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'adventure-detail',
  description: 'Adventure detail page',
  urls: [
    'https://wknd.site/ca/en/adventures/bali-surf-camp.html',
  ],
  blocks: [
    { name: 'carousel-hero', instances: ['.carousel.cmp-carousel--mini', '.carousel.cmp-carousel--hero'] },
    { name: 'columns-specs', instances: ['.cmp-contentfragment__elements'] },
    { name: 'tabs-detail', instances: ['.tabs.panelcontainer'] },
  ],
  sections: [
    {
      id: 's1', name: 'Breadcrumb', selector: ['.breadcrumb', 'nav[aria-label="Breadcrumb"]'], style: null, blocks: [], defaultContent: ['.breadcrumb'],
    },
    {
      id: 's2', name: 'Hero Carousel', selector: ['.carousel.cmp-carousel--mini', '.carousel'], style: null, blocks: ['carousel-hero'], defaultContent: [],
    },
    {
      id: 's3', name: 'Adventure Title', selector: ['.title.cmp-title--black', 'main .title'], style: null, blocks: [], defaultContent: ['main h1'],
    },
    {
      id: 's4', name: 'Adventure Body', selector: ['.cmp-contentfragment', 'main main'], style: null, blocks: ['columns-specs', 'tabs-detail'], defaultContent: ['h5'],
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
