import { useRef, useState } from "react";
import { useHtmlCapture } from "react-html-capture";

export default function ExampleAutoCapture() {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const { capture } = useHtmlCapture(ref, { auto: true, debounce: 300 });

  const increment = async () => {
    setCount((c) => c + 1);
    if (ref.current) {
      const url = await capture();
      setImgUrl(url);
    }
  };

  return (
    <div>
      <h2>Auto Capture (MutationObserver)</h2>
      <div
        ref={ref}
        style={{
          padding: 20,
          background: "#fafafa",
          borderRadius: 8,
          width: 200,
        }}
      >
        <p>Counter: {count}</p>
      </div>

      <button onClick={increment} style={{ marginTop: 10 }}>
        Increase & Capture
      </button>

      {imgUrl && (
        <img src={imgUrl} style={{ marginTop: 20, border: "1px solid #ccc" }} />
      )}
    </div>
  );
}
