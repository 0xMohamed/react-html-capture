/**
 * Small reusable helpers used across core/
 */

export type Maybe<T> = T | null | undefined;

/** Check if running in browser */
export const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

/** Merge default options with overrides */
export function mergeOptions<T extends object>(
  defaults: T,
  overrides?: Partial<T>
): T {
  return { ...defaults, ...(overrides || {}) } as T;
}

/** Simple delay */
export function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/** Convert Blob to DataURL */
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read blob as dataURL"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

/** Convert DataURL to Blob */
export async function dataURLToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

/** Download a DataURL as a file */
export function downloadDataUrl(
  dataUrl: string,
  filename: string = "capture.png"
) {
  if (!isBrowser) return;

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** Convert Blob to HTMLImageElement */
export async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image from blob"));
    };
    img.src = url;
  });
}

/**
 * Wait for all images inside a node to load
 * Useful to ensure html-to-image renders correctly
 * @param root DOM element
 * @param timeout ms to wait per image (best-effort)
 */
export async function waitForImagesInNode(root: HTMLElement, timeout = 5000) {
  const imgs = Array.from(root.querySelectorAll("img"));

  const promises = imgs.map((img) => {
    if (img.complete && (img.naturalWidth || img.naturalHeight)) return;

    return new Promise<void>((res) => {
      const t = setTimeout(() => res(), timeout); // best-effort
      img.addEventListener(
        "load",
        () => {
          clearTimeout(t);
          res();
        },
        { once: true }
      );
      img.addEventListener(
        "error",
        () => {
          clearTimeout(t);
          res();
        },
        { once: true }
      );
    });
  });

  await Promise.all(promises);
}

/** Clamp a number between min and max */
export function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}
