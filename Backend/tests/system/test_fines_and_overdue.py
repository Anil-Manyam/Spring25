import pytest
from datetime import datetime, timedelta
from bson import ObjectId
from unittest.mock import MagicMock
from app import app

# ---------------- Shared Fixtures ---------------- #

@pytest.fixture
def mongo_mocks(monkeypatch):
    mock_users  = MagicMock(name="users_col")
    mock_books  = MagicMock(name="books_col")
    mock_loans  = MagicMock(name="loans_col")
    mock_hist   = MagicMock(name="history_col")
    mock_fines  = MagicMock(name="user_fines")

    patch_map = {
        "app.users_col": mock_users,
        "app.books_col": mock_books,
        "app.loans_col": mock_loans,
        "app.history_col": mock_hist,
        "app.db": MagicMock(**{"__getitem__.side_effect": lambda name: {
            "user_fines": mock_fines
        }[name]})
    }

    for target, obj in patch_map.items():
        monkeypatch.setattr(target, obj, raising=False)

    yield {
        "users": mock_users,
        "books": mock_books,
        "loans": mock_loans,
        "history": mock_hist,
        "fines": mock_fines
    }

@pytest.fixture
def client(mongo_mocks):
    with app.test_client() as c:
        yield c, mongo_mocks

# ---------------- Fine Tests ---------------- #

def test_user_fine_with_late_loans(client, mongo_mocks):
    test_client, mocks = client
    user_id = str(ObjectId())
    late_due_date = datetime.now() - timedelta(days=3)

    mocks["loans"].find.return_value = [
        {"due_date": late_due_date}
    ]
    mocks["fines"].find_one.return_value = {"user_id": user_id, "amount": 2}

    res = test_client.get(f"/api/users/{user_id}/fine")
    assert res.status_code == 200
    assert res.json["fine"] == 3  # Max of 3 overdue days and stored 2

def test_pay_fine_partial(client, mongo_mocks):
    test_client, mocks = client
    user_id = str(ObjectId())

    mocks["fines"].find_one.return_value = {"user_id": user_id, "amount": 10}
    mocks["fines"].update_one.return_value.modified_count = 1

    res = test_client.post(f"/api/users/{user_id}/payfine", json={"amount": 4})
    assert res.status_code == 200
    assert "Remaining fine: $6" in res.json["message"]

def test_pay_fine_full(client, mongo_mocks):
    test_client, mocks = client
    user_id = str(ObjectId())

    mocks["fines"].find_one.return_value = {"user_id": user_id, "amount": 5}
    mocks["fines"].update_one.return_value.modified_count = 1

    res = test_client.post(f"/api/users/{user_id}/payfine", json={"amount": 5})
    assert res.status_code == 200
    assert "Remaining fine: $0" in res.json["message"]

def test_pay_fine_overpay_not_allowed(client, mongo_mocks):
    test_client, mocks = client
    user_id = str(ObjectId())

    mocks["fines"].find_one.return_value = {"user_id": user_id, "amount": 3}

    res = test_client.post(f"/api/users/{user_id}/payfine", json={"amount": 5})
    assert res.status_code == 400
    assert "cannot overpay" in res.json["error"]
