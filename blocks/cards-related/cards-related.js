export default function decorate(block) {
  /* change to ul, li — image-less related-stories list (title + date) */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = 'cards-related-card-body';
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
