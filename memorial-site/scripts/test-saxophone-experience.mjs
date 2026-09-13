import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { startSaxophoneEntrance } from '../app/lib/saxophoneEntrance.ts';

function fixture({ complete = false, reduce = false, hash = '' } = {}) {
  const panel = { hidden: true };
  const image = Object.assign(new EventTarget(), { complete });
  const motion = Object.assign(new EventTarget(), { matches: reduce });
  let timeout;
  let duration;
  const host = Object.assign(new EventTarget(), {
    location: { hash },
    setTimeout(fn, ms) { timeout = fn; duration = ms; return 1; },
    clearTimeout() { timeout = undefined; },
  });
  const cleanup = startSaxophoneEntrance(panel, image, motion, host);
  return { panel, image, motion, host, cleanup, expire: () => timeout?.(), duration: () => duration };
}
test('cached assets, reduced motion and deep links do not show or delay the entrance', () => {
  for (const options of [{ complete: true }, { reduce: true }, { hash: '#shared-memories' }]) {
    const f = fixture(options);
    assert.equal(f.panel.hidden, true);
    assert.equal(f.duration(), undefined);
  }
});
test('load and failure dismiss immediately; stalled assets are capped at two seconds', () => {
  for (const event of ['load', 'error']) {
    const f = fixture();
    assert.equal(f.panel.hidden, false);
    f.image.dispatchEvent(new Event(event));
    assert.equal(f.panel.hidden, true);
    f.cleanup();
  }
  const f = fixture();
  assert.equal(f.duration(), 2000);
  f.expire();
  assert.equal(f.panel.hidden, true);
});
test('interaction, preference changes and unmount all dismiss the entrance', () => {
  for (const event of ['keydown', 'pointerdown']) {
    const f = fixture();
    f.host.dispatchEvent(new Event(event));
    assert.equal(f.panel.hidden, true);
  }
  const f = fixture();
  f.motion.dispatchEvent(new Event('change'));
  assert.equal(f.panel.hidden, true);
  f.cleanup();
  assert.equal(f.duration(), 2000);
  assert.equal(f.panel.hidden, true);
});
test('video contract: click-only privacy-enhanced player, no autoplay, external fallback, both home languages', () => {
  const video = readFileSync(new URL('../app/components/SaxophoneVideo.tsx', import.meta.url), 'utf8');
  assert.match(video, /opened \? <div className="sound-player">/);
  assert.match(video, /youtube-nocookie\.com\/embed\/zuJfpkJGUZI/);
  assert.doesNotMatch(video, /autoplay[=;]/);
  assert.match(video, /Watch on YouTube/);
  assert.match(video, /영상 닫기/);
  for (const file of ['../app/page.tsx', '../app/en/page.tsx']) {
    const home = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(home, /<SaxophoneEntrance/);
    assert.match(home, /<SaxophoneVideo/);
  }
});
