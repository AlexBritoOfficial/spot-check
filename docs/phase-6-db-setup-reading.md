# Phase 6 — DB Setup Reading List

Reference docs for Phase 6 (Database & Data Model), matching the roadmap's "Learn" order. Implementation plan is saved separately at `~/.claude/plans/cozy-puzzling-treasure.md`.

## 1. Relational modeling basics
- [PostgreSQL Tutorial (official docs)](https://www.postgresql.org/docs/current/tutorial.html) — tables, columns, primary keys, types.

## 2. Prisma (this repo is on **v7** — real breaking changes vs. most tutorials/training data: driver adapters are now mandatory, config moved to `prisma.config.ts`)
- [`prisma init` (CLI v7)](https://www.prisma.io/docs/cli/v7/init)
- [PostgreSQL connector (ORM v7)](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql)
- [Database drivers (ORM v7)](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers) — the new driver-adapter requirement.
- [Generators reference (ORM v7)](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators)
- [Seeding (ORM v7)](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding)

## 3. PostGIS
- [PostGIS Documentation (official)](https://postgis.net/documentation/)
- [How to use PostgreSQL extensions with Prisma (ORM v7)](https://www.prisma.io/docs/orm/v7/prisma-schema/postgresql-extensions) — Prisma has no native geography type; the schema will use `Unsupported("geography(Point, 4326)")` plus raw SQL.
- [prisma/prisma#25768 — Geometry/Geography support request](https://github.com/prisma/prisma/issues/25768) — background on the gap.

## 4. Running Postgres locally
- [Postgres.app documentation](https://postgresapp.com/documentation/)
