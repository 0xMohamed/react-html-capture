/**
 * High-level capture pipeline using html-to-image
 * then applies post-processing (crop, watermark, etc.) via canvas helpers.
 *
 * Step-wise pipeline for clarity and testability.
 */

import * as hti from "html-to-image";
import {
  isBrowser,
  mergeOptions,
  waitForImagesInNode,
  blobToDataURL,
  blobToImage,
  dataURLToBlob,
} from "./utils";
import {
  createSizedCanvas,
  canvasToBlob,
  applyTextWatermark,
  cropCanvas,
} from "./canvas";

export type CaptureType = "png" | "jpeg" | "svg" | "webp";

export interface CaptureOptions {
  type?: CaptureType;
  quality?: number; // 0-1 (jpeg/webp)
  backgroundColor?: string | null;
  pixelRatio?: number; // multiplier of devicePixelRatio
  cacheBust?: boolean;

  region?: { x: number; y: number; width: number; height: number } | null;
  watermark?: {
    text: string;
    position?: "top-left" | "bottom-right" | "center";
  } | null;

  preserveScroll?: boolean;
  waitForImagesMs?: number;

  onBefore?: () => Promise<void> | void;
  onAfter?: (meta: {
    width: number;
    height: number;
    sizeBytes?: number;
  }) => void;
}

const DEFAULTS: Required<
  Pick<
    CaptureOptions,
    | "type"
    | "quality"
    | "backgroundColor"
    | "pixelRatio"
    | "cacheBust"
    | "waitForImagesMs"
  >
> = {
  type: "png",
  quality: 0.92,
  backgroundColor: null,
  pixelRatio: 1,
  cacheBust: false,
  waitForImagesMs: 2000,
};

// -------------------------
// Scroll helpers
// -------------------------
function snapshotScrolls(container: HTMLElement) {
  const snaps: Array<{ el: Element | Window; left: number; top: number }> = [];
  snaps.push({ el: window, left: window.scrollX, top: window.scrollY });
  const all = Array.from(container.querySelectorAll<HTMLElement>("*"));
  for (const el of all) {
    if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
      snaps.push({ el, left: el.scrollLeft, top: el.scrollTop });
    }
  }
  return snaps;
}
function restoreScrolls(
  snaps: Array<{ el: Element | Window; left: number; top: number }>
) {
  for (const s of snaps) {
    try {
      if (s.el === window) {
        window.scrollTo(s.left, s.top);
      } else {
        (s.el as HTMLElement).scrollLeft = s.left;
        (s.el as HTMLElement).scrollTop = s.top;
      }
    } catch {
      // ignore
    }
  }
}

// -------------------------
// Main capture
// -------------------------
export async function captureToDataUrl(
  node: HTMLElement,
  options?: CaptureOptions
): Promise<string> {
  if (!isBrowser)
    throw new Error("captureToDataUrl: browser environment required");

  const opts = mergeOptions(DEFAULTS, options ?? {});

  // call before hook
  if (opts.onBefore) await opts.onBefore();

  // preserve scrolls if requested
  let scrollSnaps: ReturnType<typeof snapshotScrolls> | undefined;
  if (opts.preserveScroll) {
    scrollSnaps = snapshotScrolls(node);
  }

  // wait for images
  await waitForImagesInNode(node, opts.waitForImagesMs);

  // choose html-to-image function
  const toFn =
    opts.type === "jpeg"
      ? hti.toJpeg
      : opts.type === "svg"
        ? hti.toSvg
        : hti.toPng;

  const imgOptions: any = {
    backgroundColor: opts.backgroundColor ?? null,
    quality: opts.quality ?? 0.92,
    pixelRatio: (opts.pixelRatio ?? 1) * (window.devicePixelRatio || 1),
    cacheBust: opts.cacheBust ?? false,
  };

  // capture
  let dataUrl: string = await toFn(node as any, imgOptions);

  // region crop
  if (opts.region) {
    const blob = await dataURLToBlob(dataUrl);
    const img = await blobToImage(blob);

    const canvas = createSizedCanvas({
      width: img.width,
      height: img.height,
      pixelRatio: 1,
      background: null,
    }).canvas;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const cropped = cropCanvas(canvas, opts.region);
    dataUrl = await blobToDataURL(
      await canvasToBlob(
        cropped,
        opts.type === "jpeg" ? "image/jpeg" : "image/png",
        opts.quality
      )
    );
  }

  // watermark
  if (opts.watermark) {
    const blob = await dataURLToBlob(dataUrl);
    const img = await blobToImage(blob);

    const canvas = createSizedCanvas({
      width: img.width,
      height: img.height,
      pixelRatio: 1,
      background: null,
    }).canvas;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    applyTextWatermark(canvas, opts.watermark.text, opts.watermark.position);

    dataUrl = await blobToDataURL(await canvasToBlob(canvas, "image/png"));
  }

  // meta info
  let sizeBytes: number | undefined;
  try {
    sizeBytes = (await dataURLToBlob(dataUrl)).size;
  } catch {
    /* ignore */
  }

  if (opts.onAfter) {
    try {
      opts.onAfter({
        width: node.offsetWidth,
        height: node.offsetHeight,
        sizeBytes,
      });
    } catch {
      /* ignore */
    }
  }

  // restore scrolls
  if (opts.preserveScroll && scrollSnaps) restoreScrolls(scrollSnaps);

  return dataUrl;
}

// -------------------------
// Blob variant
// -------------------------
export async function captureToBlob(
  node: HTMLElement,
  options?: CaptureOptions
): Promise<Blob> {
  const dataUrl = await captureToDataUrl(node, options);
  return await dataURLToBlob(dataUrl);
}
