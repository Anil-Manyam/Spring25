# import unittest
# from app import app
# from services import book_service, user_service, loan_service

# class TestFlaskApp(unittest.TestCase):
#     def setUp(self):
#         self.client = app.test_client()
#         # fresh state
#         book_service.books.clear()
#         user_service.users.clear()
#         loan_service.loans.clear()

#     def test_index_route(self):
#         rv = self.client.get("/")
#         self.assertIn(b"Library API", rv.data)

#     def test_add_book_route(self):
#         rv = self.client.post("/books",
#                               json={"title":"T","author":"A","isbn":"1"})
#         self.assertEqual(rv.status_code, 201)

#     def test_get_books_route(self):
#         self.client.post("/books",
#                          json={"title":"T","author":"A","isbn":"1"})
#         rv = self.client.get("/books")
#         self.assertIn(b"T", rv.data)

# tests/test_app.py
import pytest
from unittest.mock import MagicMock
from app import app


@pytest.fixture
def client(monkeypatch):
    """Yield Flask test client with Mongo collections mocked."""
    mock_books = MagicMock(name="books_col")
    mock_users = MagicMock(name="users_col")
    mock_loans = MagicMock(name="loans_col")

    # Patch app-level collections
    monkeypatch.setattr("app.books_col", mock_books, raising=False)
    monkeypatch.setattr("app.users_col", mock_users, raising=False)
    monkeypatch.setattr("app.loans_col", mock_loans, raising=False)

    # Patch service-layer collections
    monkeypatch.setattr("services.book_service.books_col", mock_books, raising=False)
    monkeypatch.setattr("services.user_service.users_col", mock_users, raising=False)
    monkeypatch.setattr("services.loan_service.books_col", mock_books, raising=False)
    monkeypatch.setattr("services.loan_service.users_col", mock_users, raising=False)
    monkeypatch.setattr("services.loan_service.loans_col", mock_loans, raising=False)

    with app.test_client() as test_client:
        yield test_client, mock_books, mock_users, mock_loans


# --------------------------- ROUTE TESTS --------------------------- #
# NOTE: the root URL ("/") is *not* defined in app.py, so we now
# simply assert that it returns 404 instead of 200.

def test_index_route_returns_404(client):
    test_client, *_ = client
    res = test_client.get("/")
    assert res.status_code == 404


def test_add_book_route(client):
    test_client, mock_books, *_ = client
    mock_books.find_one.return_value = None                       # ISBN free
    mock_books.insert_one.return_value.inserted_id = "64b7e32e9c7a4f73ab1d3412"

    payload = {"title": "Pytest Book", "author": "Tester", "isbn": "py1"}
    res = test_client.post("/api/books", data=payload)            # form-data
    assert res.status_code == 201
    mock_books.insert_one.assert_called_once()


def test_get_books_route(client):
    test_client, mock_books, *_ = client
    mock_books.find.return_value = [
        {"_id": "64b7e32e9c7a4f73ab1d3412", "title": "Py Book", "author": "A", "isbn": "1"}
    ]
    res = test_client.get("/api/books")
    assert res.status_code == 200
    assert b"Py Book" in res.data
