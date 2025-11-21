import { useEffect, useRef, useState } from "react";
import { useHtmlCapture } from "react-html-capture";

export default function ExampleShadowDom() {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLElement | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const { capture } = useHtmlCapture(hostRef);

  useEffect(() => {
    if (!hostRef.current) return;
    const shadow = hostRef.current.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        .box { padding:20px; background:#d1e7ff; border-radius:8px; }
      </style>
      <div class="box">Inside Shadow DOM</div>
    `;
    shadowRef.current = shadow as unknown as HTMLElement;
  }, []);

  return (
    <div>
      <h2>Shadow DOM</h2>
      <div ref={hostRef} />

      <button
        onClick={async () => shadowRef.current && setImgUrl(await capture())}
      >
        Capture Shadow Content
      </button>

      {imgUrl && (
        <img src={imgUrl} style={{ marginTop: 20, border: "1px solid #ccc" }} />
      )}
    </div>
  );
}
