import { useRef, useState } from "react";
import { useHtmlCapture } from "react-html-capture";

export default function ExampleCrop() {
  const ref = useRef<HTMLDivElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const { capture } = useHtmlCapture(ref, {
    region: { x: 0, y: 0, width: 120, height: 80 },
  });

  return (
    <div>
      <h2>Crop Region</h2>
      <div
        ref={ref}
        style={{ padding: 20, background: "#eee", width: 200, borderRadius: 8 }}
      >
        <h3>Hello</h3>
        <p>This is inside a cropped box.</p>
      </div>

      <button onClick={async () => ref.current && setImgUrl(await capture())}>
        Capture Cropped
      </button>

      {imgUrl && (
        <img src={imgUrl} style={{ marginTop: 20, border: "1px solid #ccc" }} />
      )}
    </div>
  );
}
