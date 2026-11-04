# La Caribeña Encajes

Internal inventory, margin, and sales tracker for **La Caribeña Encajes**, a Dominican
lingerie, pajama, and bikini boutique. Spanish-first, phone-first, built for a
non-technical owner.

- **Repository state:** scaffolded; frontend, API, and database boot locally.
- **Sources of truth:** `DESIGN.md` (design system v1) and `design.pen` (high-fidelity UI).
- **Last reviewed:** 2026-11-04.

---

## 1. Project status

| Area | Status | Notes |
| --- | --- | --- |
| Brand foundation and design system | Complete | `DESIGN.md`, v1 dated 2026-11-03 |
| High-fidelity UI design | Complete | `design.pen`, 14 screens, 15 reusable component groups |
| Scope reconciliation | Decision needed | Design file covers more modules than the v1 doc |
| Frontend (Preact + TypeScript) | Scaffolded | Vite app serves a branded shell and API status |
| Backend (Python + FastAPI + SQLAlchemy) | Scaffolded | Health endpoint, config, models, Alembic |
| Database (Postgres) | Scaffolded | One migration applied; four categories seeded |
| Docker and Docker Compose | Complete | `docker-compose.yml` runs Postgres only |
| Logo production assets | Pending | Export called out as pending in `DESIGN.md` |
| Tests | Started | Backend smoke tests; no frontend tests yet |

**Overall phase:** foundation built. Tooling, database, and a thin vertical slice work;
product features have not been implemented.

---

## 2. What already exists

### 2.1 `DESIGN.md`

A 423-line design system that defines:

- Brand foundation, logo rules, and usage guardrails.
- The full token set: 19 color tokens, 3 type families, a type scale, spacing, radii,
  borders, and shadows.
- Component contracts for buttons, inputs, chips, stat cards, tables, the net-income
  cell, modals/drawers, and navigation.
- The product list screen: structure, five fixed columns, computed net income and
  margin, behaviors, validation, and states.
- Motion, accessibility, Spanish copy voice, and v1 implementation notes.

### 2.2 `design.pen`

A Penpot-compatible design file (format version 2.19) containing:

- **25 design variables** matching `DESIGN.md`: 19 colors, 3 font families, 3 radii.
- **15 reusable component groups:** three button variants, category chip, two filter
  pills, net-income cell, navigation items, stat card, text input, currency input,
  table row, table header, mobile status bar, and mobile bottom navigation.
- **14 screens** across desktop and mobile.

### 2.3 Screens designed

| Module | Screens | Platform |
| --- | --- | --- |
| Authentication | Login | Desktop, Mobile |
| Catalog | Productos, Nuevo producto modal | Desktop |
| Catalog | Productos | Mobile |
| Categories | 1. Tarjetas, 2. Tabla y detalle, 3. Comparativa | Desktop |
| Dashboard | 1. Editorial, 2. Ventas, 3. Operativo | Desktop, Mobile |
| Sales | Ventas | Mobile |
| Operations | Operativo | Mobile |

The catalog screens follow `DESIGN.md` exactly: five columns (Producto, Categoría,
Precio, Costo, Ganancia neta), a computed net-income cell with margin, summary cards,
category filters, and pagination. The dashboard, sales, and operations screens extend
well beyond the v1 document.

---

## 3. Intended stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Frontend | Preact + TypeScript | Chosen for this build; `DESIGN.md` §12 suggests React |
| Build tool | Vite | Configured, with `/api` proxied to port 8000 |
| Styling | CSS custom properties | `DESIGN.md` tokens exported into `tokens.css` |
| Backend | Python + FastAPI | REST API, OpenAPI docs at `/docs` |
| Dependency manager | uv | Backend only; frontend uses npm |
| ORM / migrations | SQLAlchemy + Alembic | Configured; initial migration applied |
| Database | PostgreSQL | Run in Docker via Compose |
| Local runtime | Make + Docker Compose | Compose runs the database; Make runs API and web |
| Currency | `RD$`, Dominican formatting | Money stored as `NUMERIC(12,2)` |

### Service topology

| Service | Image / build | Port | Purpose |
| --- | --- | --- | --- |
| `db` | `postgres:16-alpine` | 5432 | Persistent Postgres volume |

`docker-compose.yml` provisions only Postgres. FastAPI and Vite run on the host through
`uv` and npm, which keeps hot reload fast and the Compose file small.

---

## 4. Repository layout

```text
lacaribenaencajes/
├── DESIGN.md
├── Makefile
├── README.md
├── design.pen
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── src/lacaribena_api/
│   │   ├── main.py
│   │   ├── cli.py
│   │   ├── seed.py
│   │   ├── api/routes/health.py
│   │   ├── core/config.py
│   │   ├── db/base.py
│   │   ├── db/session.py
│   │   └── models/
│   └── tests/
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── app.tsx
        ├── app.css
        ├── index.css
        └── styles/tokens.css
```

Feature folders for product screens, the `money.ts` utility, and Pydantic schemas are
not created yet.

---

## 5. Data model

| Table | Key fields | Status |
| --- | --- | --- |
| `categories` | `id`, `name`, `slug`, `color`, timestamps | Migrated and seeded |
| `products` | `id`, `name`, `category_id`, `price`, `cost`, timestamps | Migrated; no endpoints yet |
| `orders` | `id`, `customer_name`, `payment_method`, `status`, `total`, `sold_at` | Expanded scope |
| `order_items` | `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `unit_cost` | Expanded scope |
| `inventory_movements` | `id`, `product_id`, `delta`, `reason`, `created_at` | Expanded scope |
| `app_settings` | `id`, `key`, `value` | If needed for goals |

Rules:

- `ganancia neta = price - cost` and `margen % = net / price * 100`. Both are derived,
  never stored as editable product fields.
- Money uses `NUMERIC(12,2)`, never floating point.
- Stock, SKU, and supplier stay out of the v1 product table, per `DESIGN.md` §8.
- Database constraints enforce non-negative `price` and `cost`.

### API surface

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| `GET` | `/` | Service metadata | Implemented |
| `GET` | `/api/health` | API and database liveness | Implemented |
| `GET` | `/api/categories` | List categories | Planned |
| `POST` | `/api/categories` | Create category | Planned |
| `GET` | `/api/products` | List with search, filter, pagination | Planned |
| `POST` | `/api/products` | Create product | Planned |
| `PATCH` | `/api/products/{id}` | Update product | Planned |
| `DELETE` | `/api/products/{id}` | Delete product | Planned |
| `GET` | `/api/summary` | Active products, inventory value, potential profit | Planned |

The remaining dashboard, sales, and operations endpoints depend on the scope decision in
section 6.

---

## 6. Open decisions

1. **Scope of v1.** `DESIGN.md` §12 excludes authentication, sales, stock movements,
   suppliers, reports, multi-user roles, and payments. The Pen file includes login,
   sales dashboards, payment channels, stock alerts, restock queues, and tasks. Confirm
   whether v1 ships the catalog only, or catalog plus login and dashboards.
2. **Preact versus React.** The design document recommends React + Vite. This build
   standardizes on Preact + TypeScript; components and libraries must be Preact-compatible.
3. **Wordmark spelling.** `DESIGN.md` §2 writes `ENCAGES`; the Pen file and the brand
   name use `ENCAJES`. Standardize on `ENCAJES`.
4. **Computed fields placement.** Decide whether net income and margin are computed in
   the API, in the frontend, or both. The `money.ts` utility remains required for
   display formatting.
5. **Logo delivery.** Production exports for the wine, cream, and mono lockups are still
   pending; UI mockups use a typographic stand-in.
6. **Auth model.** The login screens exist, but no session, password-reset, or role model
   has been specified.
7. **Fonts.** Load Bodoni Moda, Inter, and Parisienne from Google Fonts with
   `display=swap`; self-host before launch for offline reliability.

---

## 7. Implementation roadmap

- [x] Brand foundation and design tokens
- [x] Component and screen design (desktop and mobile)
- [x] Product list specification, including computed margin
- [ ] Resolve scope and wordmark decisions
- [x] Scaffold monorepo (frontend, backend, compose, env example)
- [x] Define SQLAlchemy models and initial Alembic migration
- [x] Seed the four categories
- [ ] Implement products and categories API with validation
- [x] Export design tokens into `tokens.css`
- [x] Build app shell and responsive scaffold
- [ ] Build navigation and responsive layout
- [ ] Build the product table, search, filters, and pagination
- [ ] Build create/edit modal with live computed net income
- [ ] Add optimistic save/delete with undo
- [ ] Add loading, empty, and error states
- [ ] Write backend and frontend tests
- [ ] Add authentication if it stays in scope
- [ ] Add dashboard, sales, and operations modules if they stay in scope
- [ ] Produce logo assets and self-host fonts
- [ ] Add production container images

---

## 8. Conventions

- **Language:** interface copy in Dominican Spanish; code and documentation in English.
- **Money:** `RD$ 3,850.00`, two decimals, period thousands separator, non-breaking
  space after the symbol.
- **Derived values:** always labeled `Calculado`; the owner should never do math.
- **Design source:** `DESIGN.md` tokens map 1:1 to CSS custom properties.
- **Accessibility:** 44 px minimum touch targets, visible focus rings, AAA body
  contrast, and never color as the only signal.
- **Commit style:** Conventional Commits.

## 9. Documentation

- [`DESIGN.md`](DESIGN.md) — design system, tokens, components, product screen, states.
- `design.pen` — high-fidelity source; open with Penpot.

## 10. Running the project

Requires Docker, Docker Compose, uv, Node.js 20+, and GNU Make.

```bash
make dev
```

That single command creates `.env`, installs dependencies, starts Postgres, applies
migrations, and runs FastAPI and Vite together.

| Command | Purpose |
| --- | --- |
| `make dev` | Full stack: database, API, and web app |
| `make backend` | Database plus FastAPI only |
| `make frontend` | Vite only (expects the API on port 8000) |
| `make db-up` | Start Postgres and wait for health |
| `make db-down` | Stop Postgres |
| `make db-reset` | Delete the volume, restart, and migrate |
| `make migrate` | Apply Alembic migrations |
| `make migration m="message"` | Autogenerate a migration |
| `make seed` | Insert the four base categories |
| `make test` | Run backend tests |
| `make lint` | Ruff plus TypeScript type-check |
| `make build` | Production build of the frontend |

Local URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`

The Vite dev server proxies `/api` to FastAPI, so frontend requests are same-origin in
development. Configuration comes from `.env`; `.env.example` holds working defaults.
