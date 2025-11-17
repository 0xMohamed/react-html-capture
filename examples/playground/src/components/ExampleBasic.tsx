import { useRef, useState } from "react";
import { useHtmlCapture } from "react-html-capture";

export default function ExampleBasic() {
  const ref = useRef<HTMLDivElement>(null);
  const { capture, isLoading, error } = useHtmlCapture(ref);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  return (
    <div>
      <h2>Basic Capture</h2>
      <div
        ref={ref}
        style={{ padding: 20, background: "#eee", borderRadius: 8, width: 200 }}
      >
        <strong>Hello 👋</strong>
        <p>This is a test box.</p>
      </div>

      <button
        onClick={async () => {
          if (!ref.current) return;
          const url = await capture();
          setImgUrl(url);
        }}
        disabled={isLoading}
        style={{ marginTop: 10 }}
      >
        {isLoading ? "Capturing..." : "Capture"}
      </button>

      {error && <p style={{ color: "red" }}>{String(error)}</p>}
      {imgUrl && (
        <img src={imgUrl} style={{ marginTop: 20, border: "1px solid #ccc" }} />
      )}
    </div>
  );
}
