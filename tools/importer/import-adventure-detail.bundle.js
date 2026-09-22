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

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll(".teaser, .cmp-teaser"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const content = slide.querySelector(".cmp-teaser__content") || slide;
      const heading = content.querySelector('h1, h2, h3, .cmp-teaser__title, [class*="title"]');
      const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');
      const ctaLinks = Array.from(
        content.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a, a")
      );
      if (!image && !heading && !description && !ctaLinks.length) return;
      const textCell = [];
      if (heading) textCell.push(heading);
      if (description) textCell.push(description);
      textCell.push(...ctaLinks);
      cells.push([image || "", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-specs.js
  function parse2(element, { document: document2 }) {
    const cfRoot = element.closest(".cmp-contentfragment");
    if (cfRoot) cfRoot.querySelectorAll(".cmp-contentfragment__title").forEach((t) => t.remove());
    let specs = Array.from(element.querySelectorAll(".cmp-contentfragment__element"));
    if (!specs.length) {
      const dts = Array.from(element.querySelectorAll("dt"));
      specs = dts.map((dt) => {
        const wrapper = document2.createElement("div");
        wrapper.appendChild(dt.cloneNode(true));
        const dd = dt.nextElementSibling;
        if (dd && dd.tagName === "DD") wrapper.appendChild(dd.cloneNode(true));
        return wrapper;
      });
    }
    const cells = [];
    specs.forEach((spec) => {
      const label = spec.querySelector(".cmp-contentfragment__element-title, dt");
      const value = spec.querySelector(".cmp-contentfragment__element-value, dd");
      const labelText = label ? label.textContent.trim() : "";
      const valueText = value ? value.textContent.trim() : "";
      if (!labelText && !valueText) return;
      cells.push([labelText, valueText]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-specs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-detail.js
  function parse3(element, { document: document2 }) {
    const labels = Array.from(element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, [role="tab"]'));
    const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel, [role="tabpanel"]'));
    const cells = [];
    panels.forEach((panel, i) => {
      const label = labels[i] ? labels[i].textContent.trim() : `Tab ${i + 1}`;
      const source = panel.querySelector(".cmp-contentfragment__elements, .cmp-contentfragment, .contentfragment") || panel;
      source.querySelectorAll(".cmp-contentfragment__title").forEach((t) => t.remove());
      const contentCell = [];
      source.querySelectorAll("p, h1, h2, h3, h4, h5, h6, ul, ol, img, a, picture").forEach((node) => {
        if (node.closest("p, ul, ol, h1, h2, h3, h4, h5, h6") !== node && node.matches("a, img, picture") && node.closest("p, ul, ol, h1, h2, h3, h4, h5, h6")) {
          return;
        }
        if (node.parentElement && node.parentElement.closest("p, ul, ol, h1, h2, h3, h4, h5, h6") && node.matches("a, img, picture")) {
          return;
        }
        contentCell.push(node);
      });
      if (!contentCell.length) {
        cells.push([label, source]);
        return;
      }
      cells.push([label, contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-detail", cells });
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

  // tools/importer/import-adventure-detail.js
  var parsers = {
    "carousel-hero": parse,
    "columns-specs": parse2,
    "tabs-detail": parse3
  };
  var PAGE_TEMPLATE = {
    name: "adventure-detail",
    description: "Adventure detail page",
    urls: [
      "https://wknd.site/ca/en/adventures/bali-surf-camp.html"
    ],
    blocks: [
      { name: "carousel-hero", instances: [".carousel.cmp-carousel--mini", ".carousel.cmp-carousel--hero"] },
      { name: "columns-specs", instances: [".cmp-contentfragment__elements"] },
      { name: "tabs-detail", instances: [".tabs.panelcontainer"] }
    ],
    sections: [
      {
        id: "s1",
        name: "Breadcrumb",
        selector: [".breadcrumb", 'nav[aria-label="Breadcrumb"]'],
        style: null,
        blocks: [],
        defaultContent: [".breadcrumb"]
      },
      {
        id: "s2",
        name: "Hero Carousel",
        selector: [".carousel.cmp-carousel--mini", ".carousel"],
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "s3",
        name: "Adventure Title",
        selector: [".title.cmp-title--black", "main .title"],
        style: null,
        blocks: [],
        defaultContent: ["main h1"]
      },
      {
        id: "s4",
        name: "Adventure Body",
        selector: [".cmp-contentfragment", "main main"],
        style: null,
        blocks: ["columns-specs", "tabs-detail"],
        defaultContent: ["h5"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
  var import_adventure_detail_default = {
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
  return __toCommonJS(import_adventure_detail_exports);
})();
