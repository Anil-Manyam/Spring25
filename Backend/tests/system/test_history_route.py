import pytest
from bson import ObjectId
from datetime import datetime, timedelta
from unittest.mock import MagicMock
from app import app


@pytest.fixture
def mongo_mocks(monkeypatch):
    mock_users  = MagicMock(name="users_col")
    mock_books  = MagicMock(name="books_col")
    mock_loans  = MagicMock(name="loans_col")
    mock_hist   = MagicMock(name="history_col")

    patch_map = {
        "app.users_col": mock_users,
        "app.books_col": mock_books,
        "app.loans_col": mock_loans,
        "app.history_col": mock_hist,
        "services.loan_service.books_col": mock_books,
        "services.loan_service.users_col": mock_users,
    }

    for target, mock in patch_map.items():
        monkeypatch.setattr(target, mock, raising=False)

    yield {
        "users": mock_users,
        "books": mock_books,
        "loans": mock_loans,
        "history": mock_hist
    }


@pytest.fixture
def client(mongo_mocks):
    with app.test_client() as c:
        yield c, mongo_mocks


def test_user_history_route(client, mongo_mocks):
    test_client, mocks = client

    user_id = str(ObjectId())
    book_id = ObjectId()

    mocks["history"].find.return_value = [
        {
            "_id": ObjectId(),
            "user_id": user_id,
            "book_id": str(book_id),
            "borrow_date": datetime(2024, 10, 1),
            "return_date": datetime(2024, 10, 10),
        }
    ]

    mocks["books"].find_one.return_value = {
        "_id": book_id,
        "title": "Clean Code",
        "isbn": "9780132350884"
    }

    res = test_client.get(f"/api/users/{user_id}/history")
    assert res.status_code == 200
    assert len(res.json) == 1
    assert res.json[0]["title"] == "Clean Code"
