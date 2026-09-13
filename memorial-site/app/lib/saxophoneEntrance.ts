/** No minimum display time: cached, reduced-motion and deep-link visits skip it. */
export function startSaxophoneEntrance(panel: HTMLElement, image: HTMLImageElement | null, motion: MediaQueryList, host: Window) {
  if (!image || image.complete || motion.matches || host.location.hash) return () => {};
  panel.hidden = false;
  const finish = () => { panel.hidden = true; };
  const timeout = host.setTimeout(finish, 2000);
  image.addEventListener('load', finish);
  image.addEventListener('error', finish);
  motion.addEventListener('change', finish);
  host.addEventListener('keydown', finish, { once: true });
  host.addEventListener('pointerdown', finish, { once: true });
  return () => {
    finish();
    host.clearTimeout(timeout);
    image.removeEventListener('load', finish);
    image.removeEventListener('error', finish);
    motion.removeEventListener('change', finish);
    host.removeEventListener('keydown', finish);
    host.removeEventListener('pointerdown', finish);
  };
}
