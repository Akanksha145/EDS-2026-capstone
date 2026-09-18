import { toClassName } from '../../scripts/aem.js';

export default function decorate(block) {
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
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-selected', i === 0);
    button.addEventListener('click', () => {
      list.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', false));
      button.setAttribute('aria-selected', true);
    });
    list.append(button);
  });

  block.textContent = '';
  block.append(list);
}
