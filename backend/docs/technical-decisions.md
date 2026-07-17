# Technical Decision Document

## Why Node.js + Express (Backend)

Chosen for team familiarity and development speed within a 7-day constraint. NestJS's structure (DI, decorators, modules) offers more built-in convention but wasn't necessary at this project's scale. Express required manual discipline around folder structure (routes/controllers/services/middleware), which was maintained deliberately throughout — each layer has a single responsibility, with services kept transport-agnostic (no req/res inside business logic) so the same logic could be reused by non-HTTP callers in the future.

### Strict Request/Schema Alignment (Postman Sync)

To prevent fragile API contracts, we strictly align our Postman documentation schemas with our backend router expectations. When updating endpoints (such as transitioning from isolated field updates to a generic, comprehensive property update endpoint), the Postman collection payload was deliberately updated to match the single, unified request schema. This ensures our API's public contract remains clean, predictable, and fully testable without leaving deprecated or mismatched single-field endpoints (like single-field PATCH requests) in the documentation.

---

## Why Next.js + TanStack Query (Frontend)

Next.js was required for server-side rendering on the public listing page — critical for first-load performance and crawlability of public property listings, neither of which matters for authenticated dashboards (hence those are client-rendered). TanStack Query was chosen over Redux Toolkit/Zustand because the app's state is almost entirely server-derived (properties, favorites, auth user) rather than genuine client-only state. TanStack Query provides caching, refetching, and optimistic updates out of the box, avoiding the boilerplate of manually synchronizing server data into a client store.

---

## How Access Control Is Enforced

Three layers, deliberately redundant:

1. **Database level** — PostgreSQL enums (Role, PropertyStatus) reject invalid values outright; a `@@unique([userId, propertyId])` constraint on Favorites prevents duplicates even under race conditions, independent of application logic.

2. **Middleware level** — `authenticate` verifies JWT signature/expiry and attaches `req.user`; `authorize(...roles)` checks `req.user.role` against an allow-list per route. These are chained explicitly per route, never assumed globally.

3. **Service level** — ownership checks (`property.ownerId !== req.user.userId`) and status-based business rules (e.g., only DRAFT properties are editable) are enforced in service functions, with intentional 404-vs-403 distinctions: 404 is used whenever confirming a resource's existence would leak information to an unauthorized party (e.g., another owner's draft property); 403 is used only when the requester already has legitimate reason to know the resource exists.

> **Note:** Ownership/identity fields (`ownerId`, `userId`) are always derived from the verified JWT payload (`req.user`), never trusted from client-supplied request bodies, to prevent identity spoofing.

---

## The Hardest Technical Challenge

Mid-project, Prisma released breaking changes (v7) that fundamentally altered client instantiation — moving from a simple `datasource.url` config to a required driver-adapter pattern (`@prisma/adapter-pg`) instantiated explicitly in code, with corresponding changes to `prisma.config.ts`. This surfaced through several layered errors (missing generated files, then adapter shape mismatches) that had to be diagnosed one exact error message at a time rather than solved by pattern-matching against tutorials, which assumed an older API. This reinforced a broader lesson applied throughout the project: read the actual error and the actual current file contents before acting, rather than trusting memory of what "should" be there.

---

## What Would Break First at Scale

- **Render's free-tier cold starts** — the backend spins down after ~15 minutes idle, causing 20–30s delays on the first request after inactivity. A paid always-on tier or a scheduled keep-alive ping would resolve this.

- **Unpaginated relations** — `include: { images: true }` on property queries loads all images per property with no limit; at scale this should be paginated or lazy-loaded separately.

- **No caching layer** — every listing request hits PostgreSQL directly. A Redis cache in front of the published-properties query would reduce database load significantly under real traffic.

- **Single-instance file handling** — Multer's `memoryStorage()` buffers entire files in server memory before forwarding to Cloudinary; large concurrent uploads could exhaust memory on a small instance.

- **Lack of Bulk Upload DB Transactions** — While the image service successfully offloads files to Cloudinary, uploading images one-by-one results in multiple independent database writes. At scale, if a network interrupt occurs midway through a multi-image upload sequence, the database can end up in a partially completed "orphaned" state (where some images are saved in the database, but subsequent ones fail). Implementing a database transaction (`prisma.$transaction`) for bulk operations would guarantee an "all-or-nothing" database state.

- **Redundant Database Ownership Checks** — Currently, when multiple files are uploaded sequentially in a single user session, the service performs an ownership and status validation query (`prisma.property.findUnique`) for every single file. Under heavy user traffic, this results in **N** redundant database read queries for **N** uploaded images. At scale, this would easily bottleneck the database connection pool; validating the property state once per bulk request is required to scale image operations efficiently.

---

## Known Simplifications (Documented Trade-offs)

- **Omission of Dedicated Admin Service/Controller** — Due to the strict 7-day timeline, dedicated service and controller layers for Administrative endpoints were bypassed. Because the backend's routing architecture is highly modular, implementing these features later is incredibly simple. It would merely require mirroring our existing Controller/Service patterns and chaining the existing `authorize('ADMIN')` middleware to protect those new routes. Priority was intentionally placed on perfecting and securing the primary Client and Owner user loops first.

- **CORS** is restricted to explicit known origins (not wildcard), following secure-by-default principle established throughout the project.

- **Delete is Owner-only (not Admin)** — matching the spec's explicit Admin capability list (view all, disable) — Admin moderation is fully achieved via disable/archive, which already removes public visibility without requiring permanent deletion rights.

- **"Multiple images"** (spec language) was interpreted as a supported capability (the schema allows unlimited images per property) rather than an enforced minimum; publish requires ≥1 image, not ≥2.

- **Plain `<a>` tags** are used for navigation instead of Next.js `<Link>`, trading faster client-side transitions for implementation simplicity under time constraints.

- **3 moderate npm audit findings** exist in Prisma's internal dev-only tooling, unreachable in production since they're confined to local development tooling; fixing requires downgrading Prisma and reintroducing already-resolved breaking changes. Risk accepted.

- **Single-Key Payload Mapping in Postman** — In the Postman collection, the image upload endpoint is documented with a single-file schema mapping (`image` key instead of an array). While the schema technically allows multiple files to be associated with a property over time, the API currently handles uploads individually to keep the controller and validation logic highly focused, clean, and straightforward.

---

*Last updated: July 2026*