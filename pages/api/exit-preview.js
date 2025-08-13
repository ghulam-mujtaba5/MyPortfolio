export default function handler(req, res) {
  // Clears the preview mode cookies.
  // This function is provided by Next.js.
  res.clearPreviewData();

  // Redirect the user back to the homepage.
  res.writeHead(307, { Location: "/" });
  res.end();
}
