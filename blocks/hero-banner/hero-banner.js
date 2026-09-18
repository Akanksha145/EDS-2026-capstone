export default function decorate(block) {
  const picture = block.querySelector(':scope picture');
  if (!picture) {
    block.classList.add('no-image');
  } else {
    // move the background picture to be a direct child of the block
    const bg = document.createElement('div');
    bg.className = 'hero-banner-image';
    bg.append(picture.closest('p') || picture);
    block.prepend(bg);
  }

  // wrap the remaining (text) content into an overlaid content card
  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  [...block.children].forEach((child) => {
    if (!child.classList.contains('hero-banner-image')) {
      content.append(child);
    }
  });
  block.append(content);
}
