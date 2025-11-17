import { useRef } from "react";
import { useHtmlCapture, downloadDataUrl } from "react-html-capture";

export default function ExampleDownload() {
  const ref = useRef<HTMLDivElement>(null);
  const { capture } = useHtmlCapture(ref);

  const handleDownload = async () => {
    if (!ref.current) return;
    const url = await capture();
    downloadDataUrl(url, "capture.png");
  };

  return (
    <div>
      <h2>Download Capture</h2>
      <div
        ref={ref}
        style={{
          padding: 20,
          background: "#ffe9b0",
          width: 200,
          borderRadius: 8,
        }}
      >
        <strong>Download me!</strong>
      </div>

      <button onClick={handleDownload} style={{ marginTop: 10 }}>
        Download PNG
      </button>
    </div>
  );
}
