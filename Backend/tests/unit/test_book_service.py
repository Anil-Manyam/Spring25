import pytest
from unittest.mock import MagicMock
from services.book_service import BookService
from bson import ObjectId

@pytest.fixture
def book_service(monkeypatch):
    mock_books_col = MagicMock()
    mock_feedback_col = MagicMock()

    monkeypatch.setattr("services.book_service.books_col", mock_books_col)
    monkeypatch.setattr("services.book_service.feedback_col", mock_feedback_col)

    service = BookService()
    return service, mock_books_col, mock_feedback_col


def test_add_book_success(book_service):
    svc, books_col, _ = book_service
    books_col.find_one.return_value = None
    books_col.insert_one.return_value.inserted_id = ObjectId("64b9eaf7f2e4b1e31407aa3e")

    data = {
        "title": "New Book",
        "author": "John Doe",
        "isbn": "1234567890",
        "description": "A test book",
        "imageUrl": "http://image.jpg"
    }
    result = svc.add_book(data)

    assert result["title"] == "New Book"
    assert result["isbn"] == "1234567890"
    books_col.insert_one.assert_called_once()


def test_add_book_missing_fields(book_service):
    svc, books_col, _ = book_service
    data = {
        "author": "Missing Title",
        "isbn": "0000"
    }
    with pytest.raises(ValueError):
        svc.add_book(data)


def test_add_book_duplicate_isbn(book_service):
    svc, books_col, _ = book_service
    books_col.find_one.return_value = {"isbn": "123"}

    data = {"title": "Dup Book", "author": "Someone", "isbn": "123"}
    with pytest.raises(ValueError):
        svc.add_book(data)


def test_list_books_returns_book_ids(book_service):
    svc, books_col, _ = book_service
    books_col.find.return_value = [
        {"_id": ObjectId("64b9eaf7f2e4b1e31407aa3e"), "title": "A", "author": "B", "isbn": "111"}
    ]

    result = svc.list_books()
    assert len(result) == 1
    assert result[0]["book_id"] == "64b9eaf7f2e4b1e31407aa3e"
    assert "_id" not in result[0]


def test_remove_book_success(book_service):
    svc, books_col, _ = book_service
    books_col.find_one.return_value = {"available": True}
    books_col.delete_one.return_value.deleted_count = 1

    svc.remove_book("64b9eaf7f2e4b1e31407aa3e")
    books_col.delete_one.assert_called_once()


def test_remove_book_not_found(book_service):
    svc, books_col, _ = book_service
    books_col.find_one.return_value = None

    with pytest.raises(ValueError):
        svc.remove_book("64b9eaf7f2e4b1e31407aa3e")


def test_remove_book_unavailable(book_service):
    svc, books_col, _ = book_service
    books_col.find_one.return_value = {"available": False}

    with pytest.raises(ValueError):
        svc.remove_book("64b9eaf7f2e4b1e31407aa3e")


def test_add_feedback_success(book_service):
    svc, _, feedback_col = book_service
    svc.add_feedback("b1", "u1", "Anil", "Great book!")

    feedback_col.insert_one.assert_called_once()
    args, _ = feedback_col.insert_one.call_args
    assert args[0]["feedback"] == "Great book!"


def test_add_feedback_empty_ignored(book_service):
    svc, _, feedback_col = book_service
    svc.add_feedback("b1", "u1", "Anil", "   ")  # whitespace only

    feedback_col.insert_one.assert_not_called()


def test_get_feedback_returns_ids(book_service):
    svc, _, feedback_col = book_service
    feedback_col.find.return_value = [
        {"_id": ObjectId("64b9eaf7f2e4b1e31407aa3e"), "feedback": "Nice"}
    ]

    result = svc.get_feedback("b1")
    assert result[0]["feedback_id"] == "64b9eaf7f2e4b1e31407aa3e"
    assert "_id" not in result[0]


def test_update_book_success(book_service):
    svc, books_col, _ = book_service
    books_col.update_one.return_value.matched_count = 1

    svc.update_book("64b9eaf7f2e4b1e31407aa3e", {"title": "Updated Title"})
    books_col.update_one.assert_called_once()


def test_update_book_invalid_fields(book_service):
    svc, _, _ = book_service
    with pytest.raises(ValueError):
        svc.update_book("64b9eaf7f2e4b1e31407aa3e", {"unknown": "???"})


def test_update_book_not_found(book_service):
    svc, books_col, _ = book_service
    books_col.update_one.return_value.matched_count = 0

    with pytest.raises(ValueError):
        svc.update_book("64b9eaf7f2e4b1e31407aa3e", {"title": "New"})
