import Link from "next/link";
import { useRouter } from "next/router";

export default function LoadingTest({ delayMs, serverTime }) {
  const router = useRouter();

  const goWithDelay = (ms) => {
    // Navigate to the same page with a different delay to trigger route change
    router.push({ pathname: "/loading-test", query: { d: ms } });
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: 720,
        width: "100%",
        background: "var(--surface, rgba(0,0,0,0.03))",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
      }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Loading Animation Test</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          This page lets you test the global route-change loader. Clicking any of the controls below will navigate
          with a server delay so you can see the overlay fade in/out.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0 8px" }}>
          <button onClick={() => goWithDelay(200)} style={btnStyle}>200 ms</button>
          <button onClick={() => goWithDelay(800)} style={btnStyle}>800 ms</button>
          <button onClick={() => goWithDelay(1500)} style={btnStyle}>1.5 s</button>
          <button onClick={() => goWithDelay(3000)} style={btnStyle}>3 s</button>
          <button onClick={() => goWithDelay(6000)} style={btnStyle}>6 s (safety)</button>
        </div>

        <div style={{ marginTop: 20, fontSize: 14, color: "#555" }}>
          <div><strong>Current server delay:</strong> {delayMs} ms</div>
          <div><strong>Server time:</strong> {serverTime}</div>
        </div>

        <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid rgba(0,0,0,0.1)" }} />

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/" legacyBehavior>
            <a style={linkStyle}>Go Home</a>
          </Link>
          <Link href="/articles" legacyBehavior>
            <a style={linkStyle}>Go to Articles</a>
          </Link>
          <Link href={{ pathname: "/loading-test", query: { d: delayMs } }} legacyBehavior>
            <a style={linkStyle}>Reload same delay</a>
          </Link>
        </div>
      </div>
    </main>
  );
}

const btnStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const linkStyle = {
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  textDecoration: "none",
  color: "#111",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

export async function getServerSideProps(context) {
  const d = parseInt(context.query.d, 10);
  const delayMs = Number.isFinite(d) ? Math.max(0, Math.min(d, 15000)) : 800;

  // Simulate server latency to allow client-side route loader to appear
  await new Promise((res) => setTimeout(res, delayMs));

  return {
    props: {
      delayMs,
      serverTime: new Date().toISOString(),
    },
  };
}
