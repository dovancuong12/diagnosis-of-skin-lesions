# Project Makefile for Skin Lesion Diagnosis System
#
# This file contains common commands for development and deployment

.PHONY: help install backend-install frontend-install test test-backend test-frontend run run-backend run-frontend run-worker up down logs

help: ## Show this help message
	@echo "Available commands:"
	@echo ""
	@echo "  install          Install all project dependencies"
	@echo "  backend-install  Install backend dependencies"
	@echo "  frontend-install Install frontend dependencies"
	@echo "  test             Run all tests"
	@echo "  test-backend     Run backend tests"
	@echo "  test-frontend    Run frontend tests"
	@echo "  run              Run the full application (backend + frontend)"
	@echo "  run-backend      Run the backend service"
	@echo "  run-frontend     Run the frontend service"
	@echo "  run-worker       Run the worker service"
	@echo "  up               Start all services with Docker Compose"
	@echo "  down             Stop all services with Docker Compose"
	@echo "  logs             Show logs from Docker Compose"

install: backend-install frontend-install ## Install all project dependencies

backend-install: ## Install backend dependencies
	cd backend && pip install -r requirements.txt

frontend-install: ## Install frontend dependencies
	cd frontend && npm install

test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	cd backend && pytest

test-frontend: ## Run frontend tests
	cd frontend && npm test

run: run-backend run-frontend ## Run the full application (use separate terminals)

run-backend: ## Run the backend service
	cd backend && uvicorn app.main:app --reload

run-frontend: ## Run the frontend service
	cd frontend && npm run dev

run-worker: ## Run the worker service
	cd worker && ./run_worker.sh

up: ## Start all services with Docker Compose
	cd infra && docker-compose up -d

down: ## Stop all services with Docker Compose
	cd infra && docker-compose down

logs: ## Show logs from Docker Compose
	cd infra && docker-compose logs -f
