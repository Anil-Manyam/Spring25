import pytest
from bson import ObjectId
from unittest.mock import MagicMock, Mock
from app import app, book_service  # ✅ Import instance

# ---------------- Shared Fixtures ---------------- #

@pytest.fixture
def service_mocks(monkeypatch):
    mock_add_feedback = Mock(name="add_feedback")
    mock_get_feedback = Mock(name="get_feedback")

    # ✅ Patch the instance methods on the BookService instance
    monkeypatch.setattr(book_service, "add_feedback", mock_add_feedback)
    monkeypatch.setattr(book_service, "get_feedback", mock_get_feedback)

    return {
        "add_feedback": mock_add_feedback,
        "get_feedback": mock_get_feedback,
    }

@pytest.fixture
def client(service_mocks):
    with app.test_client() as c:
        yield c, service_mocks

# ---------------- Feedback Route Tests ---------------- #

def test_add_feedback_success(client):
    test_client, mocks = client
    book_id = str(ObjectId())
    feedback = {
        "user_id": "user123",
        "username": "john_doe",
        "feedback": "Excellent book!"
    }

    res = test_client.post(f"/api/books/{book_id}/feedback", json=feedback)
    assert res.status_code == 200
    assert "Feedback saved" in res.json["message"]
    mocks["add_feedback"].assert_called_once_with(book_id, "user123", "john_doe", "Excellent book!")

def test_get_feedback_success(client):
    test_client, mocks = client
    book_id = str(ObjectId())

    mocks["get_feedback"].return_value = [
        {"username": "jane", "text": "Nice read!"},
        {"username": "joe", "text": "Could be better."}
    ]

    res = test_client.get(f"/api/books/{book_id}/feedback")
    assert res.status_code == 200
    assert isinstance(res.json, list)
    assert res.json[0]["username"] == "jane"
    assert res.json[1]["text"] == "Could be better."
