import sys
import os
from unittest.mock import MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def mock_supabase():
    """Supabase client giả — mỗi test tự gán sẵn kết quả trả về (vd mock_supabase.auth.sign_in_with_password.return_value = ...)."""
    return MagicMock()


@pytest.fixture
def client(mock_supabase, monkeypatch):
    """TestClient dùng chung cho mọi test — tự thay supabase thật bằng bản giả, và bỏ qua việc xác thực token thật."""
    import app.routers.auth as auth_router
    import app.routers.todo as todo_router
    import app.routers.ai as ai_router
    import app.routers.stats as stats_router
    import app.routers.chat_history as chat_router
    import app.dependencies as deps

    monkeypatch.setattr(auth_router, "supabase", mock_supabase)
    monkeypatch.setattr(todo_router, "supabase", mock_supabase)
    monkeypatch.setattr(ai_router, "supabase", mock_supabase)
    monkeypatch.setattr(stats_router, "supabase", mock_supabase)
    monkeypatch.setattr(chat_router, "supabase", mock_supabase)

    from app.main import app

    def fake_verify_token():
        return {"id": "test-user-id", "email": "test@example.com", "timezone": "Asia/Ho_Chi_Minh"}

    app.dependency_overrides[deps.verify_token] = fake_verify_token

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()

@pytest.fixture
def client_real_auth(mock_supabase, monkeypatch):
    """TestClient KHÔNG override verify_token — dùng để kiểm tra đúng logic xác thực thật."""
    import app.routers.auth as auth_router
    import app.routers.todo as todo_router
    import app.routers.ai as ai_router
    import app.routers.stats as stats_router
    import app.routers.chat_history as chat_router
    import app.dependencies as deps

    monkeypatch.setattr(auth_router, "supabase", mock_supabase)
    monkeypatch.setattr(todo_router, "supabase", mock_supabase)
    monkeypatch.setattr(ai_router, "supabase", mock_supabase)
    monkeypatch.setattr(stats_router, "supabase", mock_supabase)
    monkeypatch.setattr(chat_router, "supabase", mock_supabase)
    monkeypatch.setattr(deps, "supabase", mock_supabase)

    from app.main import app
    with TestClient(app) as c:
        yield c