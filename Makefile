.PHONY: dev backend frontend install test

# Run backend + frontend in parallel
dev:
	@echo "Starting Wealth Planner OS..."
	@$(MAKE) -j2 backend frontend

backend:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

# First-time setup
install:
	@echo "Setting up backend..."
	cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
	@echo "Setting up frontend..."
	cd frontend && npm install
	@echo "Copying .env..."
	cd backend && cp -n .env.example .env || true

# Run backend tests
test:
	cd backend && . .venv/bin/activate && pytest tests/ -v

# Build frontend
build:
	cd frontend && npm run build

# Docker build (backend)
docker-build:
	cd backend && docker build -t wealth-planner-api .

docker-run:
	docker run -p 8000:8000 --env-file backend/.env wealth-planner-api
