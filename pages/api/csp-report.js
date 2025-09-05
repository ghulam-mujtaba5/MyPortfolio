// Next.js API route to receive CSP violation reports
// Handles both legacy report-uri (application/csp-report) and Reporting API (application/reports+json)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const contentType = req.headers["content-type"] || "";

  try {
    let reports = [];

    if (contentType.includes("application/reports+json")) {
      // Reporting API format: an array of reports
      reports = Array.isArray(req.body) ? req.body : [];
    } else if (contentType.includes("application/csp-report")) {
      // Legacy CSP report format: { "csp-report": { ... } }
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (body && body["csp-report"]) {
        reports = [body["csp-report"]];
      }
    } else if (contentType.includes("application/json")) {
      // Some browsers send JSON directly
      reports = Array.isArray(req.body) ? req.body : [req.body];
    } else {
      // Attempt best-effort parse
      const text = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      try {
        const parsed = JSON.parse(text);
        reports = Array.isArray(parsed) ? parsed : [parsed];
      } catch (_) {
        // swallow
      }
    }

    // Minimal logging to avoid PII; only log directive, blockedURI, and documentURI
    for (const r of reports) {
      const c = r["csp-report"] || r.body || r;
      // eslint-disable-next-line no-console
      console.warn("CSP Violation:", {
        effectiveDirective: c?.effectiveDirective || c?.violatedDirective,
        blockedURI: c?.blockedURI,
        documentURI: c?.documentURI,
        disposition: c?.disposition,
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to process CSP report:", e?.message || e);
  }

  // Always respond with 204 to avoid retry storms
  return res.status(204).end();
}
