/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-article.js
  var import_article_exports = {};
  __export(import_article_exports, {
    default: () => import_article_default
  });

  // tools/importer/parsers/cards-related.js
  function parse(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".cmp-list__item, li"));
    const cells = [];
    items.forEach((item) => {
      const itemLink = item.querySelector("a.cmp-list__item-link, .cmp-list__item-link, a");
      const titleText = item.querySelector('.cmp-list__item-title, [class*="title"]');
      const dateText = item.querySelector('.cmp-list__item-date, [class*="date"]');
      if (!itemLink && !titleText && !dateText) return;
      const contentCell = [];
      const title = titleText || itemLink;
      const label = title ? title.textContent.trim() : "";
      if (label) {
        const heading = document2.createElement("h3");
        const href = itemLink && itemLink.getAttribute("href");
        if (href) {
          const link = document2.createElement("a");
          link.setAttribute("href", href);
          link.textContent = label;
          heading.appendChild(link);
        } else {
          heading.textContent = label;
        }
        contentCell.push(heading);
      }
      if (dateText && dateText.textContent.trim()) {
        const date = document2.createElement("p");
        date.textContent = dateText.textContent.trim();
        contentCell.push(date);
      }
      if (!contentCell.length) return;
      cells.push([contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-related", cells });
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

  // tools/importer/transformers/wknd-article.js
  function transform2(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    const leadImages = Array.from(element.querySelectorAll(".image:not(.byline)")).filter((block) => !block.closest("article") && !block.closest(".contentfragment, .cmp-contentfragment"));
    leadImages.forEach((block) => block.remove());
    element.querySelectorAll(".cmp-contentfragment__title").forEach((t) => t.remove());
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
  function transform3(hookName, element, payload) {
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

  // tools/importer/import-article.js
  var parsers = {
    "cards-related": parse
  };
  var PAGE_TEMPLATE = {
    name: "article",
    description: "Long-form editorial article",
    urls: [
      "https://wknd.site/ca/en/magazine/arctic-surfing.html"
    ],
    blocks: [
      { name: "cards-related", instances: [".list.cmp-list--upnext"] }
    ],
    sections: [
      { id: "s1", name: "Lead Image", selector: [".image.cmp-image--featured", "main .image:first-of-type"], style: null, blocks: [], defaultContent: [".cmp-image"] },
      { id: "s2", name: "Breadcrumb", selector: [".breadcrumb", 'nav[aria-label="Breadcrumb"]'], style: null, blocks: [], defaultContent: [".breadcrumb"] },
      { id: "s3", name: "Article Header", selector: [".title.cmp-title--black", "main h1"], style: null, blocks: [], defaultContent: ["main h1", "main h4"] },
      { id: "s4", name: "Article Body", selector: [".contentfragment", "main article"], style: null, blocks: [], defaultContent: ["main article p", "main article h2", "blockquote"] },
      { id: "s5", name: "Author Bio", selector: [".buildingblock.cmp-buildingblock--btn-list", "main .buildingblock"], style: null, blocks: [], defaultContent: [".buildingblock"] },
      { id: "s6", name: "Related Stories Sidebar", selector: [".list.cmp-list--upnext"], style: null, blocks: ["cards-related"], defaultContent: ["h5"] }
    ]
  };
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
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
  var import_article_default = {
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
  return __toCommonJS(import_article_exports);
})();
