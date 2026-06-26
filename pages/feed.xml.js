import dbConnect from "../lib/mongoose";
import Article from "../models/Article";

const esc = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export async function getServerSideProps({ res }) {
  await dbConnect();
  const articles = await Article.find({ published: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const base = "https://ghulammujtaba.com";

  const items = articles
    .map((a) => {
      const url = `${base}/articles/${a.slug}`;
      const tags = Array.isArray(a.tags)
        ? a.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")
        : "";
      const image = a.coverImage
        ? `      <enclosure url="${esc(a.coverImage)}" type="image/jpeg" length="0" />`
        : "";
      const updated = a.updatedAt
        ? `      <lastBuildDate>${new Date(a.updatedAt).toUTCString()}</lastBuildDate>`
        : "";

      return `    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${url}</link>
      <description><![CDATA[${a.excerpt || a.description || ""}]]></description>
      <content:encoded><![CDATA[${a.excerpt || a.description || ""}]]></content:encoded>
      <author>ghulammujtaba1005@gmail.com (Ghulam Mujtaba)</author>
      <pubDate>${new Date(a.createdAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">${url}</guid>
${tags}
${image}
${updated}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Ghulam Mujtaba — Articles</title>
    <link>${base}/articles</link>
    <description>Technical articles on Full Stack Development, AI, Data Science and startups by Ghulam Mujtaba — Founder of Megicode &amp; CampusAxis.</description>
    <language>en-us</language>
    <managingEditor>ghulammujtaba1005@gmail.com (Ghulam Mujtaba)</managingEditor>
    <webMaster>ghulammujtaba1005@gmail.com (Ghulam Mujtaba)</webMaster>
    <image>
      <url>${base}/og-image.png</url>
      <title>Ghulam Mujtaba</title>
      <link>${base}/articles</link>
    </image>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=600"
  );
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function Feed() {
  return null;
}
