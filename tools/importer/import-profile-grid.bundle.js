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

  // tools/importer/import-profile-grid.js
  var import_profile_grid_exports = {};
  __export(import_profile_grid_exports, {
    default: () => import_profile_grid_default
  });

  // tools/importer/parsers/cards-profile.js
  function parse(element, { document: document2 }) {
    const card = element.closest(".cmp-experiencefragment, .experiencefragment") || element.parentElement || element;
    const image = card.querySelector(".cmp-image__image, .cmp-image img, .image img, img");
    const name = card.querySelector("h3.cmp-title__text, h3") || card.querySelector("h2, h4");
    const role = card.querySelector("h5.cmp-title__text, h5") || card.querySelector("h6");
    const socialLinks = Array.from(element.querySelectorAll("a[href]"));
    if (!image && !name && !socialLinks.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const bodyCell = [];
    if (name) {
      const heading = document2.createElement("h3");
      heading.textContent = name.textContent.trim();
      bodyCell.push(heading);
    }
    if (role) {
      const subheading = document2.createElement("h5");
      subheading.textContent = role.textContent.trim();
      bodyCell.push(subheading);
    }
    socialLinks.forEach((a) => {
      const href = a.getAttribute("href");
      const labelSource = a.querySelector(".cmp-button__text") || a;
      const label = labelSource.textContent.trim();
      if (!href && !label) return;
      const link = document2.createElement("a");
      if (href) link.setAttribute("href", href);
      link.textContent = label;
      bodyCell.push(link);
    });
    const cells = [[image || "", bodyCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-profile", cells });
    const replaceTarget = card && card !== element && card.contains(element) ? card : element;
    replaceTarget.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse2(element, { document: document2, url }) {
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

  // tools/importer/parsers/columns-featured.js
  function parse3(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const content = element.querySelector(".cmp-teaser__content") || element;
    const eyebrow = content.querySelector('.cmp-teaser__pretitle, [class*="pretitle"], [class*="eyebrow"]');
    const heading = content.querySelector('h1, h2, h3, .cmp-teaser__title, [class*="title"]:not([class*="pretitle"]):not([class*="eyebrow"])');
    const description = content.querySelector('.cmp-teaser__description, [class*="description"], p:not([class*="pretitle"])');
    const ctaLinks = Array.from(
      content.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a, a")
    );
    if (!heading && !description && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (eyebrow) textCell.push(eyebrow);
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    textCell.push(...ctaLinks);
    const cells = [[image || "", textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-featured", cells });
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

  // tools/importer/import-profile-grid.js
  var parsers = {
    "cards-profile": parse,
    "cards-article": parse2,
    "columns-featured": parse3
  };
  var PAGE_TEMPLATE = {
    name: "profile-grid",
    description: "Profile/contributor grid page",
    urls: [
      "https://wknd.site/ca/en/about-us.html"
    ],
    blocks: [
      {
        name: "columns-featured",
        instances: [".teaser.cmp-teaser--featured"]
      },
      {
        name: "cards-profile",
        instances: [".buildingblock.cmp-buildingblock--btn-list"]
      },
      {
        name: "cards-article",
        instances: [".image-list.list"]
      }
    ],
    sections: [
      {
        id: "s1",
        name: "Page Title",
        selector: [".title.cmp-title--black", "main .title:first-of-type"],
        style: null,
        blocks: [],
        defaultContent: ["main h1", ".title.cmp-title--black"]
      },
      {
        id: "s2",
        name: "Our Contributors",
        selector: [".title.cmp-title--underline", ".cmp-container .aem-Grid"],
        style: null,
        blocks: ["cards-profile"],
        defaultContent: [".title.cmp-title--underline", ".text.cmp-text--font-small"]
      },
      {
        id: "s3",
        name: "WKND Guides",
        selector: [".title.cmp-title--underline", ".cmp-container .aem-Grid"],
        style: null,
        blocks: ["cards-profile"],
        defaultContent: [".title.cmp-title--underline", ".text.cmp-text--font-small"]
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
  function mergeAdjacentBlocks(document2, main, blockName) {
    const isBlock = (el) => el && el.nodeType === 1 && el.tagName === "TABLE" && (el.querySelector("th, td")?.textContent || "").trim().toLowerCase() === blockName;
    const blocks = [...main.querySelectorAll("table")].filter(isBlock);
    const consumed = /* @__PURE__ */ new Set();
    blocks.forEach((first) => {
      if (consumed.has(first) || !first.parentNode) return;
      let next = first.nextElementSibling;
      while (isBlock(next)) {
        const rows = [...next.children].filter((c) => c.tagName === "TR");
        rows.slice(1).forEach((row) => first.appendChild(row));
        consumed.add(next);
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
    });
  }
  var import_profile_grid_default = {
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
      mergeAdjacentBlocks(document2, main, "cards-profile");
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
  return __toCommonJS(import_profile_grid_exports);
})();
