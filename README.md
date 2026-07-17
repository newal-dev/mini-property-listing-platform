# Mini Multi-Tenant Property Listing Platform

A role-based property listing platform where Owners list properties, Regular Users browse and save favorites, and Admins moderate the platform — built end-to-end with a Node.js/Express API, a Next.js frontend, and PostgreSQL.

## Status
Core requirements complete — backend, frontend, and deployment are all live.

## Live URLs
- **Frontend:** https://mini-property-listing-platform-khnu.vercel.app/
- **Backend API:** https://mini-property-listing-platform.onrender.com/api
- **Health check:** https://mini-property-listing-platform.onrender.com/health

> The backend is hosted on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after idle may take 20–30 seconds to respond while the server wakes up.

## Tech Stack
| Layer | Choice |
|---|---|
| Backend | Node.js + Express |
| ORM / Database | Prisma + PostgreSQL (hosted on Neon) |
| Frontend | Next.js (App Router) |
| State / Data fetching | TanStack Query |
| Auth | JWT + bcrypt |
| Image Storage | Cloudinary |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |

## Roles & Permissions
 
**Admin** — view all properties (any status), disable/archive any listing, view system metrics.
**Property Owner** — create properties, upload images, edit and publish draft properties, soft-delete archived properties.
**Regular User** — view published properties, save/remove favorites.

## Features
 
- JWT authentication with role-based access control enforced at the middleware, service, and database level
- Property lifecycle: `draft → published → archived`, each transition validated
- Transactional publish logic — a property can only publish if it exists, belongs to the requester, is still a draft, and has at least one image; all checks and the status update run inside a single Prisma transaction so a failure at any step rolls back cleanly
- Cloudinary image upload with server-side type and size validation before any upload occurs
- Soft deletes (`deletedAt`) — archived properties can be permanently removed by their owner; deleted rows are excluded from every query, never actually erased from the database
- Favorites with a database-level composite unique constraint (`userId` + `propertyId`), preventing duplicates even under race conditions — not just an application-level check
- Pagination and filtering (location, price range) on the public listing endpoint
- Server-side rendered public property listing for fast first load and crawlability; client-rendered, protected dashboards for each authenticated role
- Optimistic UI update on favoriting, with automatic rollback on failure and cache invalidation on settle
- Consistent, deliberate HTTP status code semantics throughout — including using 404 (not 403) wherever confirming a resource's existence would leak information to someone unauthorized to see it

## Project Documentation
- [Technical Decision Document](./docs/technical-decisions.md)
- [Postman Collection](./docs/postman_collection.json)
## Getting Started (Local Development)
 
### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```
Copy `.env.example` to `.env` and fill in real values before running.
 
### Frontend
```bash
cd frontend
npm install
npm run dev
```
Copy `.env.local.example` to `.env.local` and fill in real values before running.
 
## Environment Variables
 
**`backend/.env`**
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_random_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=4000
```
 
**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
 
## Known Limitations & Trade-offs
 
The [Technical Decision Document](./docs/technical-decisions.md) covers this in depth, including what would break first at scale (free-tier cold starts, unpaginated image relations, no caching layer, lack of bulk-upload transactions) and deliberate scope decisions made under the project's 7-day constraint (e.g. dedicated Admin service/controller layer omitted in favor of prioritizing the core Owner/User loops; delete restricted to Owner rather than Admin, matching the original spec's stated Admin capabilities).

## License
MIT