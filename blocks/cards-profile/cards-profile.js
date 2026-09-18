import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-profile-card-image';
      else div.className = 'cards-profile-card-body';
    });
    // group any trailing social/icon links into a dedicated actions row
    const body = li.querySelector('.cards-profile-card-body');
    if (body) {
      const socialLinks = [...body.querySelectorAll('a')];
      if (socialLinks.length) {
        const social = document.createElement('div');
        social.className = 'cards-profile-card-social';
        socialLinks.forEach((a) => {
          // move the link (and unwrap a lone wrapping paragraph) into the social row
          const p = a.closest('p');
          social.append(a);
          if (p && !p.textContent.trim() && !p.children.length) p.remove();
        });
        body.append(social);
      }
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  // Contributors are imported as one single-card cards-profile block per person.
  // Merge consecutive cards-profile blocks so they share one grid (source shows a
  // row of cards). A non-cards-profile block between groups (e.g. the "WKND Guides"
  // heading) breaks the run, keeping the two groups as separate grids.
  const wrapper = block.closest('.cards-profile-wrapper') || block;
  const prevWrapper = wrapper.previousElementSibling;
  const prevBlock = prevWrapper && prevWrapper.querySelector(':scope > .cards-profile');
  const prevUl = prevBlock && prevBlock.querySelector(':scope > ul');
  if (prevUl) {
    [...ul.children].forEach((li) => prevUl.append(li));
    wrapper.remove();
  }
}
