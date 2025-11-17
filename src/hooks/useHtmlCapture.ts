import { useCallback, useEffect, useRef, useState } from "react";
import { captureToDataUrl } from "../core/capture";
import { createAutoMutationObserver } from "../core/observer";

export type CaptureType = "png" | "jpeg" | "svg" | "webp";

export interface UseHtmlCaptureOptions {
  type?: CaptureType;
  quality?: number;
  backgroundColor?: string | null;
  pixelRatio?: number;
  cacheBust?: boolean;

  /** region cropping */
  region?: { x: number; y: number; width: number; height: number } | null;

  /** watermark */
  watermark?: {
    text: string;
    position?: "top-left" | "bottom-right" | "center";
  } | null;

  /** auto-capture */
  auto?: boolean;
  debounce?: number;

  /** lifecycle hooks */
  onBeforeCapture?: () => void | Promise<void>;
  onAfterCapture?: (url: string) => void;

  /** filename builder */
  fileName?: (info: { type: CaptureType; timestamp: number }) => string;
}

export interface UseHtmlCaptureReturn {
  capture: (overrides?: Partial<UseHtmlCaptureOptions>) => Promise<string>;
  captureBlob: (overrides?: Partial<UseHtmlCaptureOptions>) => Promise<Blob>;
  download: (name?: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useHtmlCapture<T extends HTMLElement | null>(
  ref: React.RefObject<T>,
  opts: UseHtmlCaptureOptions = {}
): UseHtmlCaptureReturn {
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const lastOpts = useRef(opts);
  useEffect(() => {
    lastOpts.current = opts;
  }, [opts]);

  // -------------------------------------------------------
  // Capture Core
  // -------------------------------------------------------
  const capture = useCallback(
    async (overrides?: Partial<UseHtmlCaptureOptions>) => {
      if (!isBrowser) throw new Error("Not in browser");

      const options = { ...lastOpts.current, ...overrides };
      const node = ref.current;
      if (!node) throw new Error("Ref not attached");

      setLoading(true);
      setError(null);

      try {
        // lifecycle
        if (options.onBeforeCapture) await options.onBeforeCapture();

        const url = await captureToDataUrl(node, options);

        if (options.onAfterCapture) options.onAfterCapture(url);

        setLoading(false);
        return url;
      } catch (err: unknown) {
        setLoading(false);
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [ref, isBrowser]
  );

  // -------------------------------------------------------
  // Blob
  // -------------------------------------------------------
  const captureBlob = useCallback(
    async (overrides?: Partial<UseHtmlCaptureOptions>) => {
      const url = await capture(overrides);
      const res = await fetch(url);
      return await res.blob();
    },
    [capture]
  );

  // -------------------------------------------------------
  // Download Helper
  // -------------------------------------------------------
  const download = useCallback(
    async (name?: string) => {
      const options = lastOpts.current;
      const blob = await captureBlob();
      const link = document.createElement("a");

      const fileName =
        name ??
        options.fileName?.({
          type: options.type ?? "png",
          timestamp: Date.now(),
        }) ??
        `capture-${Date.now()}.${options.type ?? "png"}`;

      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();

      setTimeout(() => URL.revokeObjectURL(link.href), 500);
    },
    [captureBlob]
  );

  // -------------------------------------------------------
  // Auto-capture (MutationObserver)
  // -------------------------------------------------------
  useEffect(() => {
    if (!isBrowser) return;
    if (!opts.auto) return;
    if (!ref.current) return;

    return createAutoMutationObserver(
      ref.current as HTMLElement,
      () => capture(),
      {
        debounceMs: opts.debounce,
      }
    );
  }, [opts.auto, opts.debounce, capture]);

  return {
    capture,
    captureBlob,
    download,
    isLoading,
    error,
  };
}
