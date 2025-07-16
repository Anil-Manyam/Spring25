# import unittest
# from Backend.models import User, Book, Loan
# from datetime import datetime, timedelta

# class TestUserModel(unittest.TestCase):
#     def test_user_init_defaults(self):
#         u = User(1, "alice", "pw", "a@x.com")
#         self.assertEqual(u.user_type, "regular")
#         self.assertEqual(u.borrow_limit, 3)

#     def test_user_librarian_limit(self):
#         lib = User(2, "bob", "pw", "b@x.com", "librarian")
#         self.assertEqual(lib.borrow_limit, 5)

#     def test_user_to_dict(self):
#         u = User(3, "eve", "pw", "e@x.com")
#         d = u.to_dict()
#         self.assertEqual(d["username"], "eve")
#         self.assertEqual(d["borrowed_books"], [])

# class TestBookModel(unittest.TestCase):
#     def test_book_available_flag(self):
#         b = Book(101, "Clean Code", "Martin", "123")
#         self.assertTrue(b.available)

#     def test_book_to_dict(self):
#         b = Book(102, "Refactoring", "Fowler", "456", False)
#         d = b.to_dict()
#         self.assertFalse(d["available"])

# class TestLoanModel(unittest.TestCase):
#     def test_loan_due_date_default(self):
#         now = datetime.utcnow()
#         loan = Loan(1, 1, 101)
#         self.assertTrue(loan.due_date > now)

#     def test_loan_to_dict(self):
#         l = Loan(2, 1, 101, "2025-08-01")
#         d = l.to_dict()
#         self.assertEqual(d["loan_id"], 2)

from models import User, Book, Loan
from datetime import datetime, timedelta


def test_user_creation_defaults():
    user = User(1, "alice", "pw", "alice@example.com")
    assert user.user_type == "regular"
    assert user.borrow_limit == 3


def test_user_librarian_limit():
    librarian = User(2, "bob", "pw", "bob@example.com", "librarian")
    assert librarian.borrow_limit == 5


def test_user_to_dict():
    user = User(3, "charlie", "pw", "charlie@example.com")
    data = user.to_dict()
    assert data["username"] == "charlie"
    assert data["borrowed_books"] == []


def test_book_available_by_default():
    book = Book(101, "Clean Code", "Robert", "123")
    assert book.available is True


def test_book_to_dict_fields():
    book = Book(102, "Refactoring", "Martin", "456", False)
    data = book.to_dict()
    assert data["available"] is False


def test_loan_due_date_future():
    now = datetime.now()
    loan = Loan(user_id=1, book_id=101)
    assert loan.due_date > now


def test_loan_to_dict_content():
    loan = Loan(user_id=1, book_id=101)
    loan.return_date = datetime(2025, 8, 1)  # Set manually

    data = loan.to_dict()
    
    # Core field checks
    assert data["user_id"] == 1
    assert data["book_id"] == 101
    assert "borrow_date" in data
    assert "due_date" in data
    assert "return_date" not in data

