# tests/test_app_routes.py
import itertools
from bson import ObjectId
from datetime import datetime, timedelta
from unittest.mock import MagicMock
import pytest
from app import app

# ---------- Shared fixtures -------------------------------------------------

@pytest.fixture
def mongo_mocks(monkeypatch):
    mock_users  = MagicMock(name="users_col")
    mock_books  = MagicMock(name="books_col")
    mock_loans  = MagicMock(name="loans_col")
    mock_hist   = MagicMock(name="history_col")

    mapping = {
        "app.users_col":  mock_users,
        "app.books_col":  mock_books,
        "app.loans_col":  mock_loans,
        "app.history_col": mock_hist,
        "services.user_service.users_col":  mock_users,
        "services.book_service.books_col":  mock_books,
        "services.loan_service.users_col":  mock_users,
        "services.loan_service.books_col":  mock_books,
        "services.loan_service.loans_col":  mock_loans,
    }
    for target, obj in mapping.items():
        monkeypatch.setattr(target, obj, raising=False)

    yield {"users": mock_users, "books": mock_books, "loans": mock_loans, "history": mock_hist}


@pytest.fixture
def client(mongo_mocks):
    with app.test_client() as c:
        yield c, mongo_mocks


# ---------- Helper generators ----------------------------------------------

_id_counter = itertools.count(1)
def _fake_hex() -> str:
    """Return a valid 24-char hex ObjectId string."""
    return ObjectId().__str__()

def _fake_user_doc(username, user_type="regular", _id=None):
    return {
        "_id": ObjectId(_id) if _id else ObjectId(),
        "username": username,
        "password": "pw",
        "user_type": user_type,
        "email": f"{username}@x.com",
    }

def _fake_book_doc(title, isbn, _id=None):
    return {
        "_id": ObjectId(_id) if _id else ObjectId(),
        "title": title,
        "author": "Auth",
        "isbn": isbn,
        "available": True,
    }

# ---------- USER ROUTE TESTS ------------------------------------------------

def test_login_bad_password(client, mongo_mocks):
    test_client, mocks = client
    mocks["users"].find_one.return_value = _fake_user_doc("dave")
    res = test_client.post("/api/users/login", json={"username": "dave", "password": "oops"})
    assert res.status_code == 400
    assert b"Incorrect password" in res.data


# ---------- ADMIN ROUTES ----------------------------------------------------

@pytest.fixture
def librarian_header(mongo_mocks):
    librarian_id = _fake_hex()
    librarian_doc = _fake_user_doc("librarian", user_type="librarian", _id=librarian_id)
    mongo_mocks["users"].find_one.side_effect = (
        lambda q: librarian_doc if q.get("_id") == ObjectId(librarian_id) else None
    )
    return {"X-User-Id": librarian_id}


def test_admin_list_users_allowed(client, librarian_header, mongo_mocks):
    test_client, mocks = client
    mocks["users"].find.return_value = [_fake_user_doc("a"), _fake_user_doc("b")]
    res = test_client.get("/api/admin/users", headers=librarian_header)
    assert res.status_code == 200


def test_admin_delete_user(client, librarian_header, mongo_mocks):
    test_client, mocks = client
    mocks["users"].delete_one.return_value.deleted_count = 1
    victim_id = _fake_hex()
    res = test_client.delete(f"/api/admin/users/{victim_id}", headers=librarian_header)
    assert res.status_code == 204
    mocks["users"].delete_one.assert_called_once()


# ---------- BOOK ROUTES -----------------------------------------------------

def test_delete_book_route(client, mongo_mocks):
    test_client, mocks = client
    mocks["books"].delete_one.return_value.deleted_count = 1
    book_id = _fake_hex()
    res = test_client.delete(f"/api/books/{book_id}")
    assert res.status_code == 200
    mocks["books"].delete_one.assert_called_once()


# ---------- LOAN ROUTE INTEGRATION TEST ------------------------------------
def test_borrow_and_return_book(client, mongo_mocks):
    test_client, mocks = client
    user_id = _fake_hex()
    book_id = _fake_hex()

    user_doc = _fake_user_doc("borrower", _id=user_id)
    book_doc = _fake_book_doc("LoanMe", "l1", _id=book_id)

    mocks["users"].find_one.return_value = user_doc
    mocks["books"].find_one.return_value = book_doc
    mocks["loans"].count_documents.return_value = 0
    mocks["loans"].insert_one.return_value.inserted_id = _fake_hex()

    def fake_loan_find_one(q):
        if (
            q.get("user_id") == user_id and
            q.get("book_id") == book_id and
            q.get("return_date") is None
        ):
            return {
                "_id": _fake_hex(),
                "user_id": user_id,
                "book_id": book_id,
                "borrow_date": datetime.now() - timedelta(days=5),
                "due_date": datetime.now() + timedelta(days=9),
                "return_date": None
            }
        return None

    mocks["loans"].find_one.side_effect = fake_loan_find_one

    borrow_res = test_client.post("/api/loans/borrow", json={"user_id": user_id, "book_id": book_id})
    assert borrow_res.status_code == 200, borrow_res.data.decode()

    return_res = test_client.post("/api/loans/return", json={"user_id": user_id, "book_id": book_id})
    assert return_res.status_code == 200, return_res.data.decode()
