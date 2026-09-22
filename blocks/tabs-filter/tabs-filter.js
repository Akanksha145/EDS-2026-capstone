import { toClassName } from '../../scripts/aem.js';

/**
 * Source category membership for the adventures listing, captured from
 * wknd.site/us/en/adventures.html (each category tab's pre-filtered panel).
 * The source is a curated, multi-category model — e.g. "Cycling Tuscany"
 * appears under both Cycling and Travel — so membership is by slug, not a
 * single derived Activity value. Keyed by the adventure's URL slug
 * (the last path segment of /{cc}/{ll}/adventures/<slug>).
 */
const CATEGORY_SLUGS = {
  climbing: ['climbing-new-zealand', 'colorado-rock-climbing'],
  cycling: ['whistler-mountain-biking', 'cycling-tuscany', 'west-coast-cycling', 'cycling-southern-utah'],
  skiing: ['downhill-skiing-wyoming', 'ski-touring-mont-blanc', 'tahoe-skiing'],
  surfing: ['bali-surf-camp', 'surf-camp-costa-rica'],
  travel: [
    'beervana-portland', 'cycling-tuscany', 'gastronomic-marais-tour',
    'napa-wine-tasting', 'riverside-camping-australia', 'yosemite-backpacking',
  ],
};

/**
 * Extract the adventure slug from a card's link href.
 * @param {Element} li a cards-article list item
 * @returns {string} the slug, or '' if none
 */
function slugFor(li) {
  const a = li.querySelector('a[href*="/adventures/"]');
  const href = a ? a.getAttribute('href') || '' : '';
  const m = href.match(/\/adventures\/([a-z0-9-]+)/);
  return m ? m[1] : '';
}

/**
 * Find the cards-article grid this filter controls. The listing places the
 * tabs-filter and the cards-article block as adjacent siblings in the same
 * section, so search the shared section wrapper first, then the whole main.
 * @param {Element} block the tabs-filter block
 * @returns {Element|null} the cards-article block, or null
 */
function findCardsBlock(block) {
  const scope = block.closest('.section') || document.querySelector('main');
  return scope ? scope.querySelector('.cards-article') : null;
}

/**
 * Apply a category filter to the cards grid. "all" shows everything.
 * The cards render asynchronously (index-driven), so callers retry until the
 * <li> cards exist.
 * @param {Element} cards the cards-article block
 * @param {string} category kebab-case category key, or 'all'
 * @returns {number} number of cards matched (0 if the grid isn't ready)
 */
function applyFilter(cards, category) {
  if (!cards) return 0;
  const items = [...cards.querySelectorAll('li')];
  if (!items.length) return 0;
  const allow = category === 'all' ? null : (CATEGORY_SLUGS[category] || []);
  items.forEach((li) => {
    const show = !allow || allow.includes(slugFor(li));
    li.style.display = show ? '' : 'none';
  });
  return items.length;
}

export default function decorate(block) {
  const cards = findCardsBlock(block);

  // Each row's first cell is a category label -> render as a filter pill button.
  const list = document.createElement('div');
  list.className = 'tabs-filter-list';
  list.setAttribute('role', 'tablist');

  [...block.children].forEach((row, i) => {
    const cell = row.firstElementChild;
    const label = (cell ? cell.textContent : row.textContent).trim();
    if (!label) return;
    const id = toClassName(label);
    const button = document.createElement('button');
    button.className = 'tabs-filter-tab';
    button.id = `filter-${id}`;
    button.textContent = label;
    button.dataset.category = id; // 'all' | 'climbing' | ...
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-selected', i === 0);
    button.addEventListener('click', () => {
      list.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', false));
      button.setAttribute('aria-selected', true);
      applyFilter(cards, id);
    });
    list.append(button);
  });

  block.textContent = '';
  block.append(list);

  // The cards grid is index-driven and may not have rendered yet. Retry the
  // initial (default-tab) filter until the cards exist, then stop.
  const initial = list.querySelector('button')?.dataset.category || 'all';
  if (cards && initial !== 'all') {
    let tries = 0;
    const tick = () => {
      if (applyFilter(cards, initial) > 0 || tries > 40) return;
      tries += 1;
      setTimeout(tick, 100);
    };
    tick();
  }
}
