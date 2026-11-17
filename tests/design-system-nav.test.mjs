import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { componentList } from '../content/component-list.js';

// The registry imports JSX previews, so read its slugs from source.
test('every component in the sidebar has a page, and every page is in the sidebar', async () => {
  const source = await readFile(new URL('../app/design-system/components/registry.js', import.meta.url), 'utf8');
  const pages = [...source.matchAll(/slug: '([a-z-]+)'/g)].map(match => match[1]);
  assert.deepEqual(componentList.map(item => item.slug), pages);
});
