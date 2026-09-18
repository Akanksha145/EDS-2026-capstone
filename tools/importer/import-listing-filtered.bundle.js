/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-listing-filtered.js
  var import_listing_filtered_exports = {};
  __export(import_listing_filtered_exports, {
    default: () => import_listing_filtered_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const content = element.querySelector(".cmp-teaser__content") || element;
    const heading = content.querySelector('h1, h2, h3, .cmp-teaser__title, [class*="title"]:not([class*="pretitle"])');
    const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');
    const ctaLinks = Array.from(
      content.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a, a")
    );
    if (!heading && !description && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-filter.js
  function parse2(element, { document: document2 }) {
    let labels = Array.from(element.querySelectorAll(".cmp-tabs__tablist .cmp-tabs__tab"));
    if (!labels.length) {
      labels = Array.from(element.querySelectorAll('[role="tab"]'));
    }
    if (!labels.length) {
      labels = Array.from(element.querySelectorAll(".cmp-tabs__tablist > li, ol.cmp-tabs__tablist > li"));
    }
    const cells = [];
    labels.forEach((tab) => {
      const label = tab.textContent.trim();
      if (!label) return;
      cells.push([label]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-filter", cells });
    const firstGrid = element.querySelector(".image-list.list");
    element.replaceWith(block);
    if (firstGrid) block.after(firstGrid);
  }

  // tools/importer/parsers/cards-article.js
  function parse3(element, { document: document2, url }) {
    let localeRoot = "/us/en";
    let pathname = "";
    try {
      pathname = new URL(url).pathname;
      const m = pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|\.|$)/);
      if (m) localeRoot = `/${m[1]}/${m[2]}`;
    } catch (e) {
    }
    let source;
    let limit = "";
    if (/\/adventures(\.|\/|$)/.test(pathname)) {
      source = `${localeRoot}/adventures/`;
    } else if (/\/magazine(\.|\/|$)/.test(pathname)) {
      source = `${localeRoot}/magazine/`;
    } else {
      let heading = "";
      let n = element.previousElementSibling;
      while (n && !heading) {
        const h = n.matches && n.matches("h1,h2,h3,h4,h5,h6") ? n : n.querySelector && n.querySelector("h1,h2,h3,h4,h5,h6");
        if (h) heading = h.textContent.trim().toLowerCase();
        n = n.previousElementSibling;
      }
      if (heading.includes("where") || heading.includes("adventure") || heading.includes("trip") || heading.includes("go")) {
        source = `${localeRoot}/adventures/`;
      } else {
        source = `${localeRoot}/magazine/`;
      }
      limit = "4";
    }
    const cells = [["Source", source]];
    if (limit) cells.push(["Limit", limit]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_wkndsite_0",
        "iframe"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.cmp-experiencefragment--header",
        "footer.cmp-experiencefragment--footer",
        "#toggleNav",
        "#mobileNav"
      ]);
      WebImporter.DOMUtils.remove(element, ["meta", "link", "noscript"]);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-listing-filtered.js
  var parsers = {
    "hero-banner": parse,
    "tabs-filter": parse2,
    "cards-article": parse3
  };
  var PAGE_TEMPLATE = {
    name: "listing-filtered",
    description: "Filterable listing page",
    urls: [
      "https://wknd.site/ca/en/adventures.html"
    ],
    blocks: [
      { name: "hero-banner", instances: [".teaser.cmp-teaser--hero", ".teaser.cmp-teaser--imagebottom"] },
      { name: "tabs-filter", instances: [".tabs.panelcontainer"] },
      { name: "cards-article", instances: [".image-list.list"] }
    ],
    sections: [
      {
        id: "s1",
        name: "Page Title",
        selector: [".title.cmp-title--black", "main .title:first-of-type"],
        style: null,
        blocks: [],
        defaultContent: ["main h1"]
      },
      {
        id: "s2",
        name: "Hero Banner",
        selector: [".teaser.cmp-teaser--hero", ".teaser"],
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "s3",
        name: "Current Adventures",
        selector: [".tabs.panelcontainer", ".image-list.list"],
        style: null,
        blocks: ["tabs-filter", "cards-article"],
        defaultContent: [".title.cmp-title--underline"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_listing_filtered_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_listing_filtered_exports);
})();
