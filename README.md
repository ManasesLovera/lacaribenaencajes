# La Caribeña Encajes

Internal inventory, margin, and sales tracker for **La Caribeña Encajes**, a Dominican
lingerie, pajama, and bikini boutique. Spanish-first, phone-first, built for a
non-technical owner.

- **Repository state:** full-stack app on SQLite, plus a frontend-only demo mode.
- **Run modes:** `make dev` (SQLite API) or `make demo` (browser-only).
- **Sources of truth:** `DESIGN.md` (design system v1) and `design.pen` (high-fidelity UI).
- **Last reviewed:** 2026-11-05.

---

## 1. Project status

| Area | Status | Notes |
| --- | --- | --- |
| Brand foundation and design system | Complete | `DESIGN.md`, v1 dated 2026-11-03 |
| High-fidelity UI design | Complete | `design.pen`, 14 screens, 15 reusable component groups |
| Scope reconciliation | Decision needed | Design file covers more modules than the v1 doc |
| Frontend (Preact + TypeScript) | Complete | All designed views, API-backed CRUD, JWT session |
| Backend (Python + FastAPI + SQLAlchemy) | Complete | JWT auth, CRUD, analytics, seeded data on SQLite |
| Database (SQLite) | Complete | `backend/lacaribena.db`, migrations, and seed data |
| Docker and Docker Compose | Optional | Postgres Compose file retained for a later migration |
| Logo production assets | Pending | Export called out as pending in `DESIGN.md` |
| Tests | Started | 16 backend tests passing; full-stack flow verified with browser QA |

**Overall phase:** the full stack works end to end. `make dev` runs SQLite, FastAPI, and
the API-backed frontend together. Production hardening is the next phase.

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

### 2.4 Frontend app

The UI in `frontend/` is a complete API-backed application:

- Login, dashboard, products, categories (three views), sales, operations, and settings.
- In `make dev` mode all data comes from FastAPI and SQLite; only the JWT is kept in browser storage.
- In `make demo` mode the same interface runs on seeded browser data in localStorage.
- Add, edit, and delete products; add categories; toggle or add tasks; edit settings.
- Search, category filters, sorting, pagination, period tabs, and computed margins.
- Responsive layouts for desktop, tablet, and mobile, including a mobile drawer and
  bottom navigation.
- JWT login against the seeded store account only.

Reset the catalog, orders, tasks, and settings from **Ajustes → Restaurar datos de
ejemplo**; the reset goes through the API and SQLite.

### 2.5 Backend

The FastAPI project in `backend/` is complete and runs on SQLite:

- JWT authentication with Argon2 password hashing. Swagger supports the
  `/api/auth/token` OAuth2 form; the app uses `POST /api/auth/login`.
- Full CRUD for products, categories, tasks, and settings.
- Orders read, create, and status updates with order-item snapshots.
- Analytics endpoints for the dashboard, sales, operations, and period summaries.
- 24 products, 4 categories, 224 generated orders, 5 tasks, and store settings seeded.
- SQLite file at `backend/lacaribena.db`; migrations managed by Alembic.

Demo credentials match the frontend: `yesenia@lacaribenaencajes.com` /
`lacaribenaencajes`.

---

## 3. Intended stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Frontend | Preact + TypeScript | Chosen for this build; `DESIGN.md` §12 suggests React |
| Build tool | Vite | Configured, with `/api` proxied to port 8000 |
| Styling | CSS custom properties | `DESIGN.md` tokens exported into `tokens.css` |
| Backend | Python + FastAPI | REST API, OpenAPI docs at `/docs` |
| Dependency manager | uv | Backend only; frontend uses npm |
| Authentication | JWT + Argon2 | `pwdlib` hashing and `pyjwt` tokens |
| ORM / migrations | SQLAlchemy + Alembic | Two migrations applied to SQLite |
| Database | SQLite | `backend/lacaribena.db`, switchable through `DATABASE_URL` |
| Local runtime | Make | SQLite needs no database container |
| Currency | `RD$`, Dominican formatting | Money stored as `NUMERIC(12,2)` |

### Runtime topology

| Service | How it runs | Port | Purpose |
| --- | --- | --- | --- |
| `api` | `uv run uvicorn` | 8000 | FastAPI and SQLite access |
| `web` | `npm run dev` | 5173 | Preact frontend |
| `db` | SQLite file | — | `backend/lacaribena.db` |

`docker-compose.yml` still provisions Postgres for a future migration, but it is not
required by the SQLite setup. FastAPI and Vite run on the host through `uv` and npm.

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
│   ├── lacaribena.db              # generated, git-ignored
│   ├── src/lacaribena_api/
│   │   ├── main.py
│   │   ├── cli.py
│   │   ├── seed.py
│   │   ├── api/routes/            # auth, products, categories, orders, tasks, settings, analytics
│   │   ├── core/config.py
│   │   ├── db/                    # base and session
│   │   ├── models/                # user, category, product, order, task, settings
│   │   ├── schemas/models.py
│   │   ├── security/auth.py
│   │   └── services/analytics.py
│   └── tests/
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── app.tsx
        ├── app.css
        ├── index.css
        ├── types.ts
        ├── components/
        │   ├── Brand.tsx
        │   ├── Shell.tsx
        │   ├── charts.tsx
        │   └── ui.tsx
        ├── data/
        │   ├── DataContext.tsx
        │   └── seed.ts
        ├── lib/
        │   ├── analytics.ts
        │   ├── auth.ts
        │   ├── format.ts
        │   └── router.ts
        ├── pages/
        │   ├── Login.tsx
        │   ├── Dashboard.tsx
        │   ├── Products.tsx
        │   ├── Categories.tsx
        │   ├── Sales.tsx
        │   ├── Operations.tsx
        │   └── Settings.tsx
        └── styles/tokens.css
```

The frontend is fully implemented; Pydantic schemas and API endpoints for products,
categories, and orders are the remaining backend work.

---

## 5. Data model

| Table | Key fields | Status |
| --- | --- | --- |
| `users` | `id`, `name`, `email`, `hashed_password`, `is_active` | Migrated and seeded |
| `categories` | `id`, `name`, `slug`, `color`, timestamps | Migrated and seeded |
| `products` | `id`, `name`, `category_id`, `price`, `cost`, `stock`, `min_stock` | Migrated and seeded |
| `orders` | `id`, `number`, `customer_name`, `payment_method`, `status`, `total`, `sold_at` | Migrated and seeded |
| `order_items` | `id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `unit_cost` | Migrated and seeded |
| `tasks` | `id`, `title`, `done`, `created_at` | Migrated and seeded |
| `store_settings` | `id`, store name, owner, goals, notification flags | Migrated and seeded |

Rules:

- `ganancia neta = price - cost` and `margen % = net / price * 100`. Both are derived,
  never stored as editable product fields.
- Money uses `NUMERIC(12,2)`, never floating point.
- Order items keep a product-name snapshot, so deleting a product preserves history.
- Database constraints enforce non-negative price, cost, stock, and minimum stock.

### API surface

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| `GET` | `/` | Service metadata | Implemented |
| `GET` | `/api/health` | API and database liveness | Implemented |
| `POST` | `/api/auth/login` | JSON login, returns JWT and user | Implemented |
| `POST` | `/api/auth/token` | OAuth2 form login for Swagger | Implemented |
| `GET` | `/api/auth/me` | Current user | Implemented |
| `GET` | `/api/categories` | List categories with product counts | Implemented |
| `POST` | `/api/categories` | Create category | Implemented |
| `PATCH` | `/api/categories/{id}` | Update category | Implemented |
| `DELETE` | `/api/categories/{id}` | Delete empty category | Implemented |
| `GET` | `/api/products` | Search, filter, sort, paginate | Implemented |
| `GET` | `/api/products/{id}` | Product detail | Implemented |
| `POST` | `/api/products` | Create product | Implemented |
| `PATCH` | `/api/products/{id}` | Update product | Implemented |
| `DELETE` | `/api/products/{id}` | Delete product | Implemented |
| `GET` | `/api/orders` | List orders by period | Implemented |
| `GET` | `/api/orders/{id}` | Order detail | Implemented |
| `POST` | `/api/orders` | Create order with item snapshots | Implemented |
| `PATCH` | `/api/orders/{id}` | Update status or payment method | Implemented |
| `GET` | `/api/tasks` | List tasks | Implemented |
| `POST` | `/api/tasks` | Create task | Implemented |
| `PATCH` | `/api/tasks/{id}` | Update title or completion | Implemented |
| `DELETE` | `/api/tasks/{id}` | Delete task | Implemented |
| `GET` | `/api/settings` | Read store settings | Implemented |
| `PUT` | `/api/settings` | Update store settings | Implemented |
| `GET` | `/api/analytics/summary` | Hoy, semana, mes, año summaries | Implemented |
| `GET` | `/api/analytics/dashboard` | Dashboard payload | Implemented |
| `GET` | `/api/analytics/sales` | Sales payload and channels | Implemented |
| `GET` | `/api/analytics/operations` | Inventory health and restock | Implemented |

In API mode the frontend consumes these endpoints through `frontend/src/lib/api.ts`.
Data is loaded and mutated through `frontend/src/data/DataContext.tsx`; localStorage only
holds the JWT. Demo mode uses the same component with seeded localStorage data.

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
4. **Computed fields placement.** Both layers compute net income and margin for their
   own concerns. The API returns them on products; the frontend keeps a formatter.
5. **Logo delivery.** Production exports for the wine, cream, and mono lockups are still
   pending; UI mockups use a typographic stand-in.
6. **Auth model.** JWT and Argon2 are implemented. Password reset, roles, and user
   management remain undefined.
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
- [x] Build navigation and responsive layout
- [x] Build the product table, search, filters, and pagination
- [x] Build create/edit modal with live computed net income
- [x] Add optimistic save/delete with undo
- [ ] Add loading skeletons and network error states
- [ ] Write backend and frontend tests
- [x] Add demo authentication with a local session
- [x] Add dashboard, sales, and operations modules
- [x] Persist products, categories, tasks, orders, and settings in SQLite
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

Requires Node.js 20+, uv, and GNU Make. Docker and Postgres are not used while the
database is SQLite.

### Run the full stack

```bash
make dev
```

This installs dependencies, applies migrations, seeds SQLite, and starts FastAPI and
Vite together:

- Web app: `http://localhost:5173`
- API: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`
- SQLite file: `backend/lacaribena.db`

Sign in with the only seeded account:

- **Email:** `yesenia@lacaribenaencajes.com`
- **Password:** `lacaribenaencajes`

The frontend stores only the JWT; all shop data is read from and written to SQLite
through the API. Use **Ajustes → Restaurar datos de ejemplo** to reseed the database.

### Run the frontend-only demo

```bash
make demo
```

This starts Vite alone with `VITE_DEMO_MODE=true`. It does not need FastAPI, uv, or
SQLite. The same 24 products, categories, orders, tasks, and settings are seeded into
localStorage, and the same seeded credentials apply:

- **Email:** `yesenia@lacaribenaencajes.com`
- **Password:** `lacaribenaencajes`

Changes persist in the browser. **Ajustes → Restaurar datos de ejemplo** restores the
local seed. `make dev` and `make demo` must not run at the same time because both use
port 5173.

| Command | Purpose |
| --- | --- |
| `make dev` | Full stack: migrations, seed, SQLite API, and Vite |
| `make demo` | Frontend only: seeded browser data in localStorage |
| `make backend` | Migrate, seed, and run FastAPI alone |
| `make frontend` | Vite alone (requires the API on port 8000) |
| `make migrate` | Apply Alembic migrations to SQLite |
| `make migration m="message"` | Autogenerate a migration |
| `make seed` | Seed SQLite (safe to run more than once) |
| `make db-reset` | Delete and rebuild the SQLite database |
| `make db-shell` | Open the SQLite file with `sqlite3` |
| `make test` | Run the 16 backend tests |
| `make lint` | Ruff plus TypeScript type-check |
| `make build` | Production build of the frontend |
| `make install` | Install backend and frontend dependencies |

The Vite dev server proxies `/api` to FastAPI, so the browser uses same-origin requests
while authentication and data remain server-side.
