SHELL := /bin/bash
.DEFAULT_GOAL := help

BACKEND := backend
FRONTEND := frontend
DB_FILE := $(BACKEND)/lacaribena.db

.PHONY: help install env demo migrate migration seed db-reset db-shell backend frontend dev test lint build

help: ## Show available commands
	@echo "La Caribeña Encajes"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

env: ## Create .env from .env.example when missing
	@test -f .env || cp .env.example .env

install: env ## Install backend and frontend dependencies
	cd $(BACKEND) && uv sync
	cd $(FRONTEND) && npm install

demo: ## Run frontend only with local browser data
	cd $(FRONTEND) && npm install
	cd $(FRONTEND) && VITE_DEMO_MODE=true npm run dev -- --host 0.0.0.0

migrate: env ## Apply Alembic migrations to SQLite
	cd $(BACKEND) && uv run alembic upgrade head

migration: ## Create a migration: make migration m="message"
	cd $(BACKEND) && uv run alembic revision --autogenerate -m "$(m)"

seed: migrate ## Seed the SQLite database
	cd $(BACKEND) && uv run python -m lacaribena_api.seed

db-reset: ## Delete the SQLite database and rebuild it
	rm -f $(DB_FILE)
	@$(MAKE) seed

db-shell: ## Open the SQLite database
	sqlite3 $(DB_FILE)

backend: seed ## Run FastAPI against SQLite
	cd $(BACKEND) && uv run uvicorn lacaribena_api.main:app --reload --host 0.0.0.0 --port 8000

frontend: ## Run the Vite dev server
	cd $(FRONTEND) && npm run dev -- --host 0.0.0.0

dev: install seed ## Run the full stack: SQLite API + frontend
	@echo "Full stack: http://localhost:5173   API docs: http://localhost:8000/docs"
	@set -e; \
	trap 'kill $$BACK_PID $$FRONT_PID 2>/dev/null || true' INT TERM EXIT; \
	(cd $(BACKEND) && uv run uvicorn lacaribena_api.main:app --reload --host 0.0.0.0 --port 8000) & BACK_PID=$$!; \
	(cd $(FRONTEND) && npm run dev -- --host 0.0.0.0) & FRONT_PID=$$!; \
	wait

test: ## Run backend tests
	cd $(BACKEND) && uv run pytest

lint: ## Lint backend and type-check frontend
	cd $(BACKEND) && uv run ruff check .
	cd $(FRONTEND) && npx tsc -b

build: ## Build the frontend for production
	cd $(FRONTEND) && npm run build
