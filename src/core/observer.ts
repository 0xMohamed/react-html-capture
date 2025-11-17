// src/core/observer.ts
/**
 * Lightweight MutationObserver wrapper used for auto-capture
 */

export interface AutoObserverOptions {
  debounceMs?: number;
  attributes?: boolean;
  childList?: boolean;
  subtree?: boolean;
  characterData?: boolean;
}

/** Create a MutationObserver that calls cb after debounceMs of silence. Returns a cleanup fn. */
export function createAutoMutationObserver(
  target: HTMLElement,
  cb: () => void,
  opts: AutoObserverOptions = {}
) {
  const {
    debounceMs = 300,
    attributes = true,
    childList = true,
    subtree = true,
    characterData = true,
  } = opts;

  let timer: ReturnType<typeof setTimeout> | null = null;
  const observer = new MutationObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      cb();
    }, debounceMs);
  });

  observer.observe(target, { attributes, childList, subtree, characterData });

  return () => {
    if (timer) clearTimeout(timer);
    observer.disconnect();
  };
}
