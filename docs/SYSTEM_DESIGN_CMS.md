# System Design — CMS (Projects & Blogs)

Last updated: 2025-08-12

## 1. Goals

- Manage Projects and Blogs via an admin panel.
- Secure CRUD APIs with proper auth; scalable and maintainable.
- Good performance via caching and ISR; safe content handling.

## 2. Data Model

### projects

- \_id (ObjectId)
- title (string, required)
- description (string)
- techStack (string or [string])
- tags ([string], index)
- imageUrl (string)
- liveUrl (string)
- repoUrl (string)
- featured (boolean, default false, index)
- createdAt, updatedAt (Date, index)

Indexes:

- { featured: 1, createdAt: -1 }
- { tags: 1 }

### blogs

- \_id (ObjectId)
- title (string, required)
- slug (string, required, unique, index)
- excerpt (string)
- content (markdown or html)
- tags ([string], index)
- published (boolean, default false, index)
- createdAt, updatedAt (Date, index)

Indexes:

- { slug: 1, unique: true }
- { published: 1, createdAt: -1 }

## 3. API Contracts (Next.js API Routes)

- /api/projects [GET] list with filters (tags, featured, q), pagination (page, limit)
- /api/projects [POST] (auth) create
- /api/projects/:id [GET|PUT|DELETE] (auth for write)
- /api/blogs [GET] list published; filter by tag; pagination
- /api/blogs [POST] (auth) create
- /api/blogs/:id [GET|PUT|DELETE] (auth for write)

Auth:

- Start with admin token in headers (Bearer <token>), migrate to NextAuth/JWT later.
- Rate-limit write endpoints.

## 4. Admin Panel

- Route: /admin (protected).
- Features: CRUD for projects/blogs, images via Cloudinary, status toggle, previews.
- Roles: Admin (owner). Future: Editor.

## 5. Caching & Revalidation

- Public GET routes: enable ISR or response caching; revalidate on create/update/delete.
- Client: SWR for lists with stale-while-revalidate.

## 6. Security

- Store secrets in env vars; never commit.
- Validate inputs server-side; sanitize HTML if rich text.
- CSRF protection for admin UI; HTTPS only.
- CSP updates for external media domains.

## 7. Observability

- Structured logs in API routes (method, status, latency).
- Metrics: request counts, error rates.

## 8. Deployment

- Vercel; configure env vars; add IP allow rules in Atlas.
- Backup Strategy: Atlas continuous backup; export scripts for collections.

## 9. Roadmap (Tech)

- v1: Token auth + CRUD + basic admin.
- v2: NextAuth/JWT, roles, audit log.
- v3: MDX blogs + image pipeline + preview drafts.
