# Mini Multi-Tenant Property Listing Platform

A simplified role-based property listing platform built with 
Node.js/Express, Next.js, and PostgreSQL.

## Status
🚧 In active development — Day 4/7 (Requirements & Design phase complete)

## Tech Stack
- Backend: Node.js + Express + Prisma (PostgreSQL)
- Frontend: Next.js (coming soon)
- State Management: TanStack Query (coming soon)
- Image Storage: Cloudinary
- Auth: JWT + bcrypt

## Backend Features (Complete)
- JWT authentication with role-based access control (Admin, Owner, User)
- Property CRUD with draft/published/archived lifecycle
- Transactional publish validation (requires ≥1 image)
- Cloudinary image upload with type/size validation
- Admin moderation (view all, disable/archive)
- Soft-delete with archive-first restriction
- Favorites with database-enforced uniqueness
- Pagination and filtering (location, price range)

## Project Documentation
- [SDLC Plan](./docs/sdlc.md) (coming soon)
- [Technical Decision Document](./docs/technical-decisions.md) (coming soon)
- API Documentation: (coming soon — Postman collection / Swagger)

## Getting Started
Backend setup instructions coming once deployment is finalized.

## License
MIT