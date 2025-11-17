# react-html-capture

A modern **React hook** for capturing HTML nodes as images — with **crop**, **watermark**, **auto-capture**, and **Shadow DOM support**.  
Lightweight, flexible, and perfect for exporting UI elements, receipts, charts, or custom components.

## ✨ Features

- 🚀 Capture Formats: PNG, JPEG, WebP, SVG
- ✂️ Crop / Region Capture: Capture only a part of the node
- 💧 Watermark: Add text watermark at top-left, bottom-right, or center
- 🌀 Auto-Capture: Automatically capture when DOM mutates
- 🪞 Shadow DOM Support: Works inside shadow roots
- 📏 Preserve Scroll Position: Snapshot & restore scroll positions
- ⚡ SSR Safe: Won’t break on server-side rendering
- ⏱️ Lifecycle Hooks: `onBeforeCapture` & `onAfterCapture`
- 📥 Download Helpers: Easy built-in download function

## 📦 Installation

```bash
npm install react-html-capture
# or
yarn add react-html-capture
# or
pnpm add react-html-capture
```

### 🛠️ Peer Dependencies

This library requires React 18+:

```bash
npm install react react-dom
```

## 🚀 Quick Start

```tsx
import { useHtmlCapture, downloadDataUrl } from "react-html-capture";
import { useRef } from "react";

export function App() {
  const ref = useRef<HTMLDivElement>(null);
  const { capture, captureBlob, isLoading, error } = useHtmlCapture(ref);

  const handleCapture = async () => {
    const dataUrl = await capture({
      type: "png",
      watermark: { text: "My App", position: "bottom-right" },
    });
    downloadDataUrl(dataUrl, "snapshot.png");
  };

  return (
    <div>
      <div ref={ref} style={{ padding: 20, border: "1px solid #ccc" }}>
        Capture this content!
      </div>
      <button onClick={handleCapture} disabled={isLoading}>
        {isLoading ? "Capturing..." : "Capture"}
      </button>
      {error && <p style={{ color: "red" }}>{error.message}</p>}
    </div>
  );
}
```

## ⚙️ Options

| Option            | Type                                                                                                            | Default     | Description                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------- |
| `type`            | `"png"` \| `"jpeg"` \| `"svg"` \| `"webp"`                                                                      | `"png"`     | Output image format                   |
| `quality`         | `number`                                                                                                        | `0.92`      | JPEG/WebP quality (0–1)               |
| `backgroundColor` | `string \| null`                                                                                                | `null`      | Background color override             |
| `pixelRatio`      | `number`                                                                                                        | `1`         | Multiplier of devicePixelRatio        |
| `cacheBust`       | `boolean`                                                                                                       | `false`     | Cache-bust image URLs                 |
| `auto`            | `boolean`                                                                                                       | `false`     | Enable auto-capture on DOM changes    |
| `debounce`        | `number`                                                                                                        | `300`       | Debounce time for auto-capture        |
| `region`          | `{ x: number, y: number, width: number, height: number } \| null`                                               | `null`      | Crop region (partial capture)         |
| `watermark`       | `{ text: string; position?: "top-left" \| "top-right" \| "bottom-left" \| "bottom-right" \| "center" } \| null` | `null`      | Add watermark to captured image       |
| `preserveScroll`  | `boolean`                                                                                                       | `false`     | Keep scroll positions unchanged       |
| `onBefore`        | `() => void \| Promise<void>`                                                                                   | `undefined` | Callback fired before capture starts  |
| `onAfter`         | `(meta: { width: number; height: number; sizeBytes?: number }) => void`                                         | `undefined` | Callback fired after capture finishes |
| `shadowDom`       | `boolean`                                                                                                       | `false`     | Capture inside shadow DOM             |

## 🎨 Examples

### Basic Capture

```tsx
const { capture } = useHtmlCapture(ref);
const dataUrl = await capture();
```

### Auto-Capture

```tsx
const { capture } = useHtmlCapture(ref, { auto: true, debounce: 500 });
```

### Capture With Crop + Watermark

```tsx
await capture({
  type: "png",
  region: { x: 20, y: 30, width: 300, height: 200 },
  watermark: {
    text: "Demo",
    position: "center",
    fontSize: 18,
    color: "rgba(255, 0, 0, 0.4)",
  },
});
```

### Shadow DOM Support

```tsx
capture({ shadowDom: true });
```

### Download Helper

```tsx
downloadDataUrl(dataUrl, "snapshot.png");
```

## 🌐 Browser Support

- 🌐 **Modern browsers:** Chrome, Firefox, Safari, Edge
- 🛡️ **SSR safe:** won't run on Node.js

## 🤝 Contributing

Contributions are welcome! Please submit a Pull Request or open an issue.

## 📖 Learn More

- [html-to-image Documentation](https://github.com/bubkoo/html-to-image#readme)
- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN: Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

## 📄 License

MIT
