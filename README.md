# La Caribeña Encajes

Internal inventory, margin, and sales tracker for **La Caribeña Encajes**, a Dominican
lingerie, pajama, and bikini boutique. Spanish-first, phone-first, built for a
non-technical owner.

- **Repository state:** design complete, implementation not started.
- **Sources of truth:** `DESIGN.md` (design system v1) and `design.pen` (high-fidelity UI).
- **Last reviewed:** 2026-11-04.

---

## 1. Project status

| Area | Status | Notes |
| --- | --- | --- |
| Brand foundation and design system | Complete | `DESIGN.md`, v1 dated 2026-11-03 |
| High-fidelity UI design | Complete | `design.pen`, 14 screens, 15 reusable component groups |
| Scope reconciliation | Decision needed | Design file covers more modules than the v1 doc |
| Frontend (Preact + TypeScript) | Not started | No application code in the repository |
| Backend (Python + FastAPI + SQLAlchemy) | Not started | No application code in the repository |
| Database (Postgres) | Not started | No schema, migrations, or seed data |
| Docker and Docker Compose | Not started | `docker-compose.yml` is planned, not present |
| Logo production assets | Pending | Export called out as pending in `DESIGN.md` |
| Tests | Not started | No test tooling configured |

**Overall phase:** pre-implementation. The interface is fully specified and drawn; the
application has not been scaffolded.

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
| Build tool | Vite | Assumed for the Preact app; not yet configured |
| Styling | CSS custom properties | Tokens exported 1:1 from `DESIGN.md` into `:root` |
| Backend | Python + FastAPI | REST API, OpenAPI docs at `/docs` |
| ORM / migrations | SQLAlchemy + Alembic | Alembic not yet configured |
| Database | PostgreSQL | Run in Docker |
| Local runtime | Docker Compose | Single command for db, api, and web |
| Currency | `RD$`, Dominican formatting | Money stored as `NUMERIC(12,2)` |

### Planned service topology

| Service | Image / build | Port | Purpose |
| --- | --- | --- | --- |
| `db` | `postgres:16` | 5432 | Persistent Postgres volume |
| `api` | `backend/Dockerfile` | 8000 | FastAPI application |
| `web` | `frontend/Dockerfile` | 5173 | Preact development server |

A `docker-compose.yml` will wire these three services with a shared network, a named
database volume, and an `.env`-driven configuration. It does not exist yet.

---

## 4. Planned repository layout

None of the application paths below exist yet; this is the target structure.

```text
lacaribenaencajes/
├── DESIGN.md
├── README.md
├── design.pen
├── docker-compose.yml            # planned
├── .env.example                  # planned
├── backend/
│   ├── Dockerfile                # planned
│   ├── pyproject.toml            # planned
│   ├── alembic/                  # planned
│   └── app/
│       ├── main.py               # planned
│       ├── core/                 # config, database session
│       ├── models/               # SQLAlchemy models
│       ├── schemas/              # Pydantic schemas
│       └── api/                  # routers
└── frontend/
    ├── Dockerfile                # planned
    ├── package.json              # planned
    └── src/
        ├── main.tsx              # planned
        ├── components/           # buttons, table, chips, modal
        ├── screens/              # Productos, Dashboard, Ventas, Operativo
        ├── lib/money.ts          # single currency + margin formatter
        └── styles/tokens.css     # DESIGN.md tokens
```

---

## 5. Planned data model

| Table | Key fields | Status |
| --- | --- | --- |
| `categories` | `id`, `name`, `slug`, `color`, timestamps | Core v1 |
| `products` | `id`, `name`, `category_id`, `price`, `cost`, timestamps | Core v1 |
| `orders` | `id`, `customer_name`, `payment_method`, `status`, `total`, `sold_at` | Expanded scope |
| `order_items` | `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `unit_cost` | Expanded scope |
| `inventory_movements` | `id`, `product_id`, `delta`, `reason`, `created_at` | Expanded scope |
| `app_settings` | `id`, `key`, `value` | If needed for goals |

Rules:

- `ganancia neta = price - cost` and `margen % = net / price * 100`. Both are derived,
  never stored as editable product fields.
- Money uses `NUMERIC(12,2)`, never floating point.
- Stock, SKU, and supplier stay out of the v1 product table, per `DESIGN.md` §8.

### Planned API surface

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness check |
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Create category |
| `GET` | `/api/products` | List with search, filter, pagination |
| `POST` | `/api/products` | Create product |
| `PATCH` | `/api/products/{id}` | Update product |
| `DELETE` | `/api/products/{id}` | Delete product |
| `GET` | `/api/summary` | Active products, inventory value, potential profit |

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
- [ ] Scaffold monorepo (frontend, backend, compose, env example)
- [ ] Define SQLAlchemy models and initial Alembic migration
- [ ] Seed the four categories and sample catalog
- [ ] Implement products and categories API with validation
- [ ] Export design tokens into `tokens.css`
- [ ] Build app shell, navigation, and responsive layout
- [ ] Build the product table, search, filters, and pagination
- [ ] Build create/edit modal with live computed net income
- [ ] Add optimistic save/delete with undo
- [ ] Add loading, empty, and error states
- [ ] Write backend and frontend tests
- [ ] Add authentication if it stays in scope
- [ ] Add dashboard, sales, and operations modules if they stay in scope
- [ ] Produce logo assets and self-host fonts
- [ ] Containerize and document one-command startup

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

No runnable application exists yet. Once scaffolding lands, the intended flow is:

```bash
cp .env.example .env
docker compose up --build
```

The web app will be served at `http://localhost:5173`, the API at
`http://localhost:8000`, and OpenAPI docs at `http://localhost:8000/docs`.
