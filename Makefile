.PHONY: install dev clean lint test help

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m

help: ## 도움말 표시
	@echo "$(GREEN)Roomie 프로젝트 명령어$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

# ========================================
# 설치
# ========================================
install: install-mobile install-api ## 전체 의존성 설치

install-mobile: ## 모바일 앱 의존성 설치
	@echo "$(GREEN)📱 모바일 앱 의존성 설치 중...$(NC)"
	cd apps/mobile && npm install

install-api: ## API 서버 의존성 설치
	@echo "$(GREEN)🐍 API 서버 의존성 설치 중...$(NC)"
	cd apps/api && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt

# ========================================
# 개발 서버
# ========================================
dev-mobile: ## 모바일 앱 개발 서버 실행 (Metro)
	@echo "$(GREEN)📱 Metro 서버 시작...$(NC)"
	cd apps/mobile && npm start

dev-api: ## API 개발 서버 실행
	@echo "$(GREEN)🐍 API 서버 시작...$(NC)"
	cd apps/api && . venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# ========================================
# 린트 & 포맷
# ========================================
lint: lint-mobile lint-api ## 전체 린트 검사

lint-mobile: ## 모바일 앱 린트
	cd apps/mobile && npm run lint

lint-api: ## API 린트 (Ruff)
	cd apps/api && . venv/bin/activate && ruff check .

format-api: ## API 코드 포맷팅 (Ruff)
	cd apps/api && . venv/bin/activate && ruff format .

# ========================================
# 테스트
# ========================================
test: test-mobile test-api ## 전체 테스트 실행

test-mobile: ## 모바일 앱 테스트
	cd apps/mobile && npm test

test-api: ## API 테스트
	cd apps/api && . venv/bin/activate && pytest

# ========================================
# 정리
# ========================================
clean: ## 빌드 아티팩트 정리
	@echo "$(YELLOW)🧹 정리 중...$(NC)"
	rm -rf apps/mobile/node_modules
	rm -rf apps/mobile/ios/Pods
	rm -rf apps/mobile/ios/build
	rm -rf apps/mobile/android/build
	rm -rf apps/mobile/android/app/build
	rm -rf apps/api/venv
	rm -rf apps/api/__pycache__
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
