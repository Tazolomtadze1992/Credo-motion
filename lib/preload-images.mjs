// Fetch and decode images before the step that shows them opens (plan 010 G4),
// so a guide picture or a demo photo is ready when its step or state arrives.
// Each URL loads once per page; decoding happens off the main thread.
const started = new Set();

export function preloadImages(urls, createImage = () => (typeof Image === 'undefined' ? null : new Image())) {
  const fresh = urls.filter(url => !started.has(url));
  for (const url of fresh) {
    const image = createImage();
    if (!image) return [];
    started.add(url);
    image.decoding = 'async';
    image.src = url;
    image.decode?.().catch(() => {});
  }
  return fresh;
}
