import dbConnect from "../lib/mongoose";
import Article from "../models/Article";

export async function getServerSideProps({ res }) {
  await dbConnect();
  const articles = await Article.find({ published: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const base = "https://ghulammujtaba.com";
  const items = articles
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${base}/articles/${a.slug}</link>
      <description><![CDATA[${a.excerpt || a.description || ""}]]></description>
      <pubDate>${new Date(a.createdAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">${base}/articles/${a.slug}</guid>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ghulam Mujtaba — Articles</title>
    <link>${base}/articles</link>
    <description>Technical articles on Full Stack Development, AI, Data Science by Ghulam Mujtaba</description>
    <language>en</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/xml");
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
