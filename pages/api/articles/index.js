import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";
import { createAuditLog } from "../../../lib/auditLog";
// import { apiRateLimiter, applyRateLimiter } from '../../../lib/rate-limiter';
import { validate } from "../../../lib/validation/validator";
import { createArticleSchema } from "../../../lib/validation/schemas";

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function handler(req, res) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  await dbConnect();

  if (req.method === "GET") {
    try {
      const {
        limit = "9",
        page = "1",
        skip,
        q = "",
        search = "",
        tag = "",
        category = "",
        sort = "relevance",
      } = req.query;
      const pageSize = Math.min(parseInt(limit, 10) || 9, 100);
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const effectiveSearch = String(search || q || "").trim();
      const parsedSkip =
        skip !== undefined ? parseInt(skip, 10) || 0 : (pageNum - 1) * pageSize;

      const now = new Date();
      const baseFilter = {
        published: true,
        $or: [{ publishAt: null }, { publishAt: { $lte: now } }],
      };
      if (tag) {
        baseFilter.tags = tag;
      }
      if (category) {
        const cat = String(category);
        const bucket = cat.toLowerCase();
        const makeRegexes = (parts) => parts.map((p) => new RegExp(p, "i"));
        // Do not attempt to filter for 'all' or 'others' buckets here
        if (bucket !== "all" && bucket !== "others") {
          let regexes = [];
          if (bucket.includes("academic") || bucket.includes("learning")) {
            regexes = makeRegexes(["academic", "learning"]);
          } else if (bucket.includes("project") || bucket.includes("career")) {
            regexes = makeRegexes(["project", "career"]);
          } else if (bucket.includes("engineer") || bucket.includes("development")) {
            regexes = makeRegexes(["engineer", "development"]);
          } else if (bucket.includes("tech") || bucket.includes("trend")) {
            regexes = makeRegexes(["tech", "trend"]);
          } else {
            // Treat as a raw category label
            regexes = [new RegExp(cat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")];
          }
          if (regexes.length > 0) {
            baseFilter.categories = { $in: regexes };
          }
        }
      }
      const useText = !!effectiveSearch;
      const filter = useText
        ? { ...baseFilter, $text: { $search: effectiveSearch } }
        : baseFilter;

      const projection = {
        title: 1,
        slug: 1,
        excerpt: 1,
        tags: 1,
        categories: 1,
        createdAt: 1,
        coverImage: 1,
        views: 1,
        ...(useText ? { score: { $meta: "textScore" } } : {}),
      };

      let sortOrder;
      switch (sort) {
        case "views":
          sortOrder = { views: -1, createdAt: -1 };
          break;
        case "newest":
          sortOrder = { createdAt: -1 };
          break;
        case "oldest":
          sortOrder = { createdAt: 1 };
          break;
        case "relevance":
        default:
          sortOrder = useText
            ? { score: { $meta: "textScore" }, createdAt: -1 }
            : { createdAt: -1 };
          break;
      }

      const [articles, total] = await Promise.all([
        Article.find(filter)
          .select(projection)
          .sort(sortOrder)
          .skip(parsedSkip)
          .limit(pageSize)
          .lean(),
        Article.countDocuments(filter),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      return res.status(200).json({
        articles,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total,
          totalPages,
          search: effectiveSearch,
        },
      });
    } catch (e) {
      return res
        .status(500)
        .json({ error: "Failed to fetch articles", details: e.message });
    }
  }

  if (req.method === "POST") {
    if (!session || !["admin", "editor"].includes(session.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      // req.body is already validated by the middleware
      const {
        title,
        content,
        excerpt,
        tags = [],
        categories = [],
        highlights = [],
        published,
        coverImage,
        showCoverImage,
        metaTitle,
        metaDescription,
        ogImage,
        publishAt,
        slug,
      } = req.body;

      const toArray = (v) =>
        Array.isArray(v)
          ? v
          : String(v || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

      const parsedTags = toArray(tags);
      const parsedCategories = toArray(categories);
      const bucketize = (label) => {
        const normalized = String(label || "").toLowerCase();
        if (normalized.includes("academic") || normalized.includes("learning")) return "Academics & Learning";
        if (normalized.includes("project") || normalized.includes("career")) return "Projects & Career";
        if (normalized.includes("engineer") || normalized.includes("development")) return "Engineering & Development";
        if (normalized.includes("tech") || normalized.includes("trend")) return "Tech Insights & Trends";
        return "Others";
      };
      const normalizedCategories = Array.from(new Set(parsedCategories.map(bucketize)));
      const parsedHighlights = toArray(highlights);
      const parsedPublishAt = publishAt
        ? typeof publishAt === "string"
          ? new Date(publishAt)
          : publishAt
        : null;

      const newArticle = new Article({
        title,
        slug: slug || slugify(title),
        content,
        excerpt,
        tags: parsedTags,
        categories: normalizedCategories,
        highlights: parsedHighlights,
        published,
        publishAt: parsedPublishAt,
        coverImage,
        showCoverImage,
        metaTitle,
        metaDescription,
        ogImage,
        author: session.id,
      });

      const savedArticle = await newArticle.save();

      await createAuditLog({
        session,
        action: "create",
        entity: "Article",
        entityId: savedArticle._id.toString(),
        details: `Article created: ${savedArticle.title}`,
      });

      return res.status(201).json(savedArticle);
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(409)
          .json({ error: "An article with this slug already exists." });
      }
      return res
        .status(500)
        .json({ error: "Failed to create article", details: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

// Wrap the handler with validation and then rate limiting
const validatedHandler = validate(createArticleSchema)(handler);

export default validatedHandler;
