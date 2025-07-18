import pytest
from unittest.mock import MagicMock
from datetime import datetime
from services.loan_service import LoanService


@pytest.fixture
def mock_mongo_collections(monkeypatch):
    books_col = MagicMock(name="books_col")
    users_col = MagicMock(name="users_col")
    loans_col = MagicMock(name="loans_col")
    history_col = MagicMock(name="history_col")
    user_fines_col = MagicMock(name="user_fines_col")

    monkeypatch.setattr("services.loan_service.books_col", books_col)
    monkeypatch.setattr("services.loan_service.users_col", users_col)
    monkeypatch.setattr("services.loan_service.loans_col", loans_col)
    monkeypatch.setattr("services.loan_service.history_col", history_col)
    monkeypatch.setattr("services.loan_service.user_fines_col", user_fines_col)
    return {
        "books": books_col,
        "users": users_col,
        "loans": loans_col,
        "history": history_col,
        "fines": user_fines_col,
    }

@pytest.fixture
def service():
    return LoanService()

def test_borrow_book_success(mock_mongo_collections, monkeypatch, service):
    mocks = mock_mongo_collections
    monkeypatch.setattr("services.loan_service.get_user_outstanding_fine", lambda uid: 0)
    valid_user_id = "64dfc2e7d5d6f3d9c9e3b7a0"
    valid_book_id = "64dfc2e7d5d6f3d9c9e3b7b1"
    mocks["books"].find_one.return_value = {"_id": valid_book_id, "available": True, "title": "Test Book", "isbn": "123"}
    mocks["users"].find_one.return_value = {"_id": valid_user_id, "borrowed_books": []}
    service.borrow_book(valid_user_id, valid_book_id)
    mocks["books"].update_one.assert_called_once()
    mocks["users"].update_one.assert_called_once()
    mocks["loans"].insert_one.assert_called_once()


def test_borrow_book_no_stock(mock_mongo_collections, monkeypatch, service):
    mocks = mock_mongo_collections
    monkeypatch.setattr("services.loan_service.get_user_outstanding_fine", lambda uid: 0)

    valid_user_id = "64dfc2e7d5d6f3d9c9e3b7a0"
    valid_book_id = "64dfc2e7d5d6f3d9c9e3b7b1"

    mocks["books"].find_one.return_value = {"_id": valid_book_id, "available": False}
    mocks["users"].find_one.return_value = {"_id": valid_user_id, "borrowed_books": []}

    with pytest.raises(ValueError, match="Book not available"):
        service.borrow_book(valid_user_id, valid_book_id)


def test_borrow_book_over_limit(mock_mongo_collections, monkeypatch, service):
    mocks = mock_mongo_collections
    monkeypatch.setattr("services.loan_service.get_user_outstanding_fine", lambda uid: 0)

    valid_user_id = "64dfc2e7d5d6f3d9c9e3b7a0"
    valid_book_id = "64dfc2e7d5d6f3d9c9e3b7b1"

    mocks["books"].find_one.return_value = {"_id": valid_book_id, "available": True}
    mocks["users"].find_one.return_value = {"_id": valid_user_id, "borrowed_books": ["a", "b", "c"]}

    with pytest.raises(ValueError, match="Borrowing limit reached"):
        service.borrow_book(valid_user_id, valid_book_id)


def test_return_book_success(mock_mongo_collections, monkeypatch, service):
    mocks = mock_mongo_collections
    monkeypatch.setattr("services.loan_service.get_user_outstanding_fine", lambda uid: 0)

    valid_user_id = "64dfc2e7d5d6f3d9c9e3b7a0"
    valid_book_id = "64dfc2e7d5d6f3d9c9e3b7b1"

    mocks["loans"].find_one.return_value = {
        "_id": "loan1",
        "user_id": valid_user_id,
        "book_id": valid_book_id,
        "borrow_date": datetime(2024, 7, 1),
        "due_date": datetime(2099, 7, 1)
    }
    mocks["books"].find_one.return_value = {
        "_id": valid_book_id,
        "title": "Clean Code",
        "isbn": "123"
    }

    result = service.return_book(valid_user_id, valid_book_id)
    assert "fine" in result
    mocks["loans"].delete_one.assert_called_once()
    mocks["books"].update_one.assert_called_once()
    mocks["users"].update_one.assert_called_once()
    mocks["history"].insert_one.assert_called_once()


def test_return_book_invalid(mock_mongo_collections, monkeypatch, service):
    mocks = mock_mongo_collections
    monkeypatch.setattr("services.loan_service.get_user_outstanding_fine", lambda uid: 0)

    mocks["loans"].find_one.return_value = None

    with pytest.raises(ValueError, match="This book was not borrowed by the user"):
        service.return_book("64dfc2e7d5d6f3d9c9e3b7a0", "64dfc2e7d5d6f3d9c9e3b7b1")


def test_get_all_loans(mock_mongo_collections, service):
    mocks = mock_mongo_collections

    mocks["loans"].find.return_value = [{
        "user_id": "64dfc2e7d5d6f3d9c9e3b7a0",
        "book_id": "64dfc2e7d5d6f3d9c9e3b7b1",
        "borrow_date": datetime(2024, 7, 1),
        "due_date": datetime(2024, 7, 15)
    }]
    mocks["users"].find_one.return_value = {"username": "anil"}
    mocks["books"].find_one.return_value = {"title": "Test Book", "isbn": "xyz"}

    result = service.get_all_loans()
    assert isinstance(result, list)
    assert result[0]["username"] == "anil"
    assert result[0]["title"] == "Test Book"


def test_fine_calculation(mock_mongo_collections):
    from services.loan_service import get_user_outstanding_fine

    mocks = mock_mongo_collections
    mocks["fines"].find_one.return_value = {"user_id": "1", "amount": 10}

    assert get_user_outstanding_fine("1") == 10
