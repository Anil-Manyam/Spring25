# tests/system/test_user_flow.py
from bson import ObjectId
from datetime import datetime, timedelta
from unittest.mock import MagicMock
import pytest
from app import app


@pytest.fixture
def client(monkeypatch):
    mocks = {
        "users":  MagicMock(name="users_col"),
        "books":  MagicMock(name="books_col"),
        "loans":  MagicMock(name="loans_col"),
        "fines":  MagicMock(name="user_fines_col"),
        "history": MagicMock(name="history_col"),
    }

    # Patch collections
    monkeypatch.setattr("app.users_col",  mocks["users"])
    monkeypatch.setattr("app.books_col",  mocks["books"])
    monkeypatch.setattr("app.loans_col",  mocks["loans"])
    monkeypatch.setattr("app.db",         { "user_fines": mocks["fines"] }, raising=False)

    monkeypatch.setattr("services.user_service.users_col",  mocks["users"])
    monkeypatch.setattr("services.book_service.books_col", mocks["books"])
    monkeypatch.setattr("services.loan_service.users_col", mocks["users"])
    monkeypatch.setattr("services.loan_service.books_col", mocks["books"])
    monkeypatch.setattr("services.loan_service.loans_col", mocks["loans"])
    monkeypatch.setattr("services.loan_service.history_col", mocks["history"])
    monkeypatch.setattr("services.loan_service.get_user_outstanding_fine", lambda user_id: 0)

    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c, mocks


def test_full_user_flow(client):
    test_client, m = client

    # ---------- Register --------------------------------------------------
    m["users"].find_one.return_value = None
    m["users"].insert_one.return_value.inserted_id = ObjectId()
    user_id = str(m["users"].insert_one.return_value.inserted_id)

    res = test_client.post("/api/users/register", json={
        "username": "flowuser",
        "password": "pw",
        "confirm_password": "pw",
        "email": "f@x.com",
        "user_type": "regular",
    })
    assert res.status_code == 201

    # ---------- Login -----------------------------------------------------
    m["users"].find_one.return_value = {
        "_id": ObjectId(user_id),
        "username": "flowuser",
        "password": "pw",
        "user_type": "regular",
    }
    res = test_client.post("/api/users/login", json={
        "username": "flowuser", "password": "pw"
    })
    assert res.status_code == 200

    # ---------- Add book --------------------------------------------------
    book_id_obj = ObjectId()
    book_id = str(book_id_obj)

    m["books"].find_one.return_value = None
    m["books"].insert_one.return_value.inserted_id = book_id_obj
    res = test_client.post("/api/books", data={
        "title": "SysTest",
        "author": "Tester",
        "isbn": "isbnSYS",
    })
    assert res.status_code == 201

    # ---------- Borrow ----------------------------------------------------
    m["books"].find_one.return_value = {
        "_id": book_id_obj,
        "available": True,
        "title": "SysTest",
    }
    m["users"].find_one.return_value["borrow_limit"] = 3
    m["loans"].count_documents.return_value = 0
    m["loans"].insert_one.return_value.inserted_id = ObjectId()

    res = test_client.post("/api/loans/borrow", json={
        "user_id": user_id, "book_id": book_id
    })
    assert res.status_code == 200

    # ---------- Return (on time) -----------------------------------------
    m["loans"].find_one.return_value = {
        "_id": ObjectId(),
        "user_id": user_id,
        "book_id": book_id,
        "borrow_date": datetime.now() - timedelta(days=1),
        "due_date": datetime.now() + timedelta(days=13),
        "return_date": None,
    }

    res = test_client.post("/api/loans/return", json={
        "user_id": user_id, "book_id": book_id
    })
    assert res.status_code == 200
    assert res.get_json()["fine"] == 0
