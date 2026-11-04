SHELL := /bin/bash
.DEFAULT_GOAL := help

COMPOSE ?= docker compose
BACKEND := backend
FRONTEND := frontend

.PHONY: help install env db-up db-down db-reset db-logs db-shell migrate migration seed backend frontend dev test lint build

help: ## Show available commands
	@echo "La Caribeña Encajes"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

env: ## Create .env from .env.example when missing
	@test -f .env || cp .env.example .env

install: env ## Install backend and frontend dependencies
	cd $(BACKEND) && uv sync
	cd $(FRONTEND) && npm install

db-up: env ## Start Postgres and wait until healthy
	@$(COMPOSE) up -d db
	@printf "Waiting for Postgres"
	@until [ "$$(docker inspect -f '{{.State.Health.Status}}' lacaribena-db 2>/dev/null)" = "healthy" ]; do printf "."; sleep 1; done
	@echo " ready"

db-down: ## Stop Postgres
	@$(COMPOSE) down

db-reset: ## Delete the database volume and start fresh
	@$(COMPOSE) down -v
	@$(MAKE) db-up
	@$(MAKE) migrate

db-logs: ## Follow Postgres logs
	@$(COMPOSE) logs -f db

db-shell: ## Open psql inside the database
	@$(COMPOSE) exec db sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

migrate: ## Apply Alembic migrations
	cd $(BACKEND) && uv run alembic upgrade head

migration: ## Create a migration: make migration m="message"
	cd $(BACKEND) && uv run alembic revision --autogenerate -m "$(m)"

seed: ## Insert the four base categories
	cd $(BACKEND) && uv run python -m lacaribena_api.seed

backend: db-up migrate ## Run FastAPI with a healthy database
	cd $(BACKEND) && uv run uvicorn lacaribena_api.main:app --reload --host 0.0.0.0 --port 8000

frontend: ## Run the Vite dev server
	cd $(FRONTEND) && npm run dev -- --host 0.0.0.0

dev: install db-up migrate ## Run database, API, and web app together
	@echo "API: http://localhost:8000/docs   Web: http://localhost:5173"
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
