// src/core/canvas.ts
/**
 * Canvas helpers: create canvas with DPR scaling, draw image, crop, watermark.
 */

import { blobToImage } from "./utils";

export interface CanvasCreateOpts {
  width: number;
  height: number;
  pixelRatio?: number; // multiply devicePixelRatio by this
  background?: string | null;
}

export function createSizedCanvas(opts: CanvasCreateOpts) {
  const dpr =
    opts.pixelRatio ??
    (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(opts.width * dpr);
  canvas.height = Math.round(opts.height * dpr);
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  // scale back to CSS pixels so drawing coordinates use CSS units
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (opts.background) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, opts.width, opts.height);
  }

  return { canvas, ctx, dpr };
}

export function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number
) {
  ctx.drawImage(img, 0, 0, width, height);
}

/** Crop a canvas to a region (x, y, w, h) returning a new canvas */
export function cropCanvas(
  source: HTMLCanvasElement,
  region: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height } = region;
  const out = document.createElement("canvas");
  // Note: source may have been scaled by DPR already; treat coordinates as CSS pixels
  out.width = Math.round(
    width * (source.width / (source.getBoundingClientRect().width || width))
  );
  out.height = Math.round(
    height * (source.height / (source.getBoundingClientRect().height || height))
  );
  const ctx = out.getContext("2d")!;
  // draw with offset to get region
  // compute scale factors
  const sx =
    (x * source.width) / (source.getBoundingClientRect().width || width);
  const sy =
    (y * source.height) / (source.getBoundingClientRect().height || height);
  ctx.drawImage(
    source,
    sx,
    sy,
    out.width,
    out.height,
    0,
    0,
    out.width,
    out.height
  );
  return out;
}

/** Apply a simple text watermark onto a canvas. Returns same canvas for chaining. */
export function applyTextWatermark(
  canvas: HTMLCanvasElement,
  text: string,
  position: "top-left" | "bottom-right" | "center" = "bottom-right",
  opts?: {
    font?: string;
    padding?: number;
    fillStyle?: string;
    opacity?: number;
  }
) {
  const ctx = canvas.getContext("2d")!;
  const font = opts?.font ?? "20px sans-serif";
  const padding = opts?.padding ?? 10;
  const fillStyle = opts?.fillStyle ?? "rgba(255,255,255,0.8)";
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  // compute measured width in CSS pixels
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = parseInt(font, 10) || 20;
  let x = padding;
  let y = padding + textHeight;

  if (position === "bottom-right") {
    x = canvas.width / (window.devicePixelRatio || 1) - textWidth - padding;
    y = canvas.height / (window.devicePixelRatio || 1) - padding;
  } else if (position === "center") {
    x = canvas.width / (window.devicePixelRatio || 1) / 2 - textWidth / 2;
    y = canvas.height / (window.devicePixelRatio || 1) / 2 + textHeight / 2;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
  return canvas;
}

/** Convert canvas -> Blob (promise) */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Failed to export canvas to blob"));
        resolve(blob);
      },
      type,
      typeof quality === "number" ? quality : undefined
    );
  });
}

/** Helper: draw a blob/image onto a new sized canvas and return canvas */
export async function imageBlobToCanvas(
  blob: Blob,
  width: number,
  height: number,
  pixelRatio?: number,
  background?: string | null
) {
  const img = await blobToImage(blob);
  const { canvas, ctx } = createSizedCanvas({
    width,
    height,
    pixelRatio,
    background,
  });
  drawImageOnCanvas(ctx, img, width, height);
  return canvas;
}
