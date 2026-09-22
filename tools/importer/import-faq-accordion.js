/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'accordion-faq': accordionFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'faq-accordion',
  description: 'FAQ accordion page',
  urls: [
    'https://wknd.site/ca/en/faqs.html',
  ],
  blocks: [
    { name: 'accordion-faq', instances: ['.accordion.panelcontainer'] },
  ],
  sections: [
    {
      id: 's1', name: 'FAQ Content', selector: ['.accordion.panelcontainer', 'main .cmp-container'], style: 'narrow', blocks: ['accordion-faq'], defaultContent: ['main h1', '.cmp-image', '.cmp-text'],
    },
    {
      id: 's2', name: 'Need more help', selector: ['.title.cmp-title--right', 'main main:last-of-type'], style: 'narrow', blocks: [], defaultContent: ['h3', '.cmp-text'],
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

    // Insert a divider block before the "Need more help?" follow-up block so a
    // visible hairline separates it from the accordion (source shows a rule
    // there). Uses the divider block rather than a bare <hr> (which EDS treats
    // as a section boundary). No-op if the heading is missing or a divider is
    // already present just before it.
    const helpHeading = [...main.querySelectorAll('h1, h2, h3, h4')]
      .find((h) => /need more help/i.test(h.textContent || ''));
    if (helpHeading) {
      const prev = helpHeading.previousElementSibling;
      const prevIsDivider = prev
        && (prev.tagName === 'HR'
          || /(^|\s)divider(\s|$)/i.test((prev.querySelector('th, td')?.textContent || '').trim()));
      if (!prevIsDivider) {
        const divider = WebImporter.Blocks.createBlock(document, { name: 'Divider', cells: {} });
        helpHeading.before(divider);
      }
    }

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
