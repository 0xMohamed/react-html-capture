import { useState } from "react";
import ExampleBasic from "./components/ExampleBasic";
import ExampleAutoCapture from "./components/ExampleAutoCapture";
import ExampleCrop from "./components/ExampleCrop";
import ExampleDownload from "./components/ExampleDownload";
import ExampleShadowDom from "./components/ExampleShadowDom";
// لو هنضيف أمثلة لاحقاً
// import ExampleWatermark from "./components/ExampleWatermark";
// import ExamplePreserveScroll from "./components/ExamplePreserveScroll";
// import ExampleAllOptions from "./components/ExampleAllOptions";

const EXAMPLES = {
  basic: { label: "Basic", component: <ExampleBasic /> },
  crop: { label: "Crop", component: <ExampleCrop /> },
  auto: { label: "Auto Capture", component: <ExampleAutoCapture /> },
  download: { label: "Download", component: <ExampleDownload /> },
  shadow: { label: "Shadow DOM", component: <ExampleShadowDom /> },
  // watermark: { label: "Watermark", component: <ExampleWatermark /> },
  // scroll: { label: "Preserve Scroll", component: <ExamplePreserveScroll /> },
  // all: { label: "All Options", component: <ExampleAllOptions /> },
} as const;

export default function App() {
  const [active, setActive] = useState<keyof typeof EXAMPLES>("basic");

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>react-html-capture – Examples</h1>

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        {Object.entries(EXAMPLES).map(([key, ex]) => (
          <button
            key={key}
            onClick={() => setActive(key as keyof typeof EXAMPLES)}
            style={{
              ...styles.tab,
              ...(active === key ? styles.tabActive : {}),
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Mounted Example */}
      <div style={styles.exampleBox}>{EXAMPLES[active].component}</div>
    </div>
  );
}

const styles: Record<string, any> = {
  container: {
    fontFamily: "sans-serif",
    padding: "20px",
  },
  title: {
    marginBottom: "20px",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  tab: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "#fafafa",
    cursor: "pointer",
  },
  tabActive: {
    background: "#333",
    color: "white",
    borderColor: "#333",
  },
  exampleBox: {
    padding: "20px",
    border: "1px solid #eee",
    borderRadius: "8px",
    background: "white",
  },
};
