import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';

/**
 * Normalize an index image URL to a same-origin path. The query-index bakes
 * absolute URLs against the production host (main--…aem.live); loading those
 * from another host (a branch preview) is a cross-origin request that gets
 * blocked. Strip the origin so the image always loads from the current host.
 * @param {string} url
 * @returns {string}
 */
function sameOriginImage(url) {
  if (!url) return url;
  try {
    const u = new URL(url, window.location.href);
    return u.pathname + u.search; // drop origin, keep path + optimization query
  } catch (e) {
    return url;
  }
}

/**
 * Build a single card <li> from an index entry.
 * @param {object} entry query-index row: { path, title, description, image }
 */
function cardFromEntry(entry) {
  const li = document.createElement('li');

  const imageCell = document.createElement('div');
  imageCell.className = 'cards-article-card-image';
  if (entry.image) {
    const link = document.createElement('a');
    link.href = entry.path;
    const pic = createOptimizedPicture(sameOriginImage(entry.image), entry.title || '', false, [{ width: '750' }]);
    link.append(pic);
    imageCell.append(link);
  }

  const body = document.createElement('div');
  body.className = 'cards-article-card-body';
  const h = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = entry.path;
  titleLink.textContent = entry.title || entry.path;
  h.append(titleLink);
  body.append(h);
  if (entry.description) {
    const p = document.createElement('p');
    p.textContent = entry.description;
    body.append(p);
  }

  li.append(imageCell, body);
  return li;
}

/**
 * Index-driven mode: fetch query-index.json, filter/sort/limit, render cards.
 * @param {Element} block
 * @param {object} cfg parsed block config (source, limit, sort)
 */
async function decorateFromIndex(block, cfg) {
  const source = cfg.source || cfg.index || cfg.query;
  const limit = cfg.limit ? parseInt(cfg.limit, 10) : 0;
  const sort = (cfg.sort || '').trim();

  block.textContent = '';
  // Reserve layout space and mark loading so there is no empty flash / layout
  // shift while the index is fetched.
  block.dataset.loading = 'true';
  const ul = document.createElement('ul');
  block.append(ul);

  try {
    // /content first (localhost / aem up), then root (DA/EDS prod).
    let resp = await fetch('/content/query-index.json');
    if (!resp.ok) resp = await fetch('/query-index.json');
    if (!resp.ok) { delete block.dataset.loading; return; } // index not published yet
    const json = await resp.json();
    let rows = Array.isArray(json.data) ? json.data : [];

    // filter by path prefix (source), excluding the listing page itself
    if (source) {
      rows = rows.filter((r) => r.path && r.path.startsWith(source) && r.path !== source.replace(/\/$/, ''));
    }

    // sort: "field" asc, "-field" desc
    if (sort) {
      const desc = sort.startsWith('-');
      const key = desc ? sort.slice(1) : sort;
      rows.sort((a, b) => String(a[key] || '').localeCompare(String(b[key] || '')) * (desc ? -1 : 1));
    }

    if (limit > 0) rows = rows.slice(0, limit);

    rows.forEach((entry) => ul.append(cardFromEntry(entry)));
  } catch (e) {
    // leave the list empty on any fetch/parse error
  } finally {
    delete block.dataset.loading;
  }
}

/**
 * Static mode: original behavior — transform authored rows into cards.
 * @param {Element} block
 */
function decorateStatic(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-article-card-image';
      else div.className = 'cards-article-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}

export default function decorate(block) {
  // Index-driven when the block is authored with a config (source/index/query key);
  // otherwise fall back to the original static card rendering.
  const cfg = readBlockConfig(block);
  if (cfg.source || cfg.index || cfg.query) {
    decorateFromIndex(block, cfg);
  } else {
    decorateStatic(block);
  }
}
