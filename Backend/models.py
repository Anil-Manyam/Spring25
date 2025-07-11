# lms_backend/models.py

# lms_backend/models.py
from datetime import datetime, timedelta

class User:
    def __init__(self, user_id, username, password, email, user_type="regular"):
        self.user_id = user_id
        self.username = username
        self.password = password
        self.email = email
        self.user_type = user_type  # regular or librarian
        self.borrowed_books = set()
        self.borrow_limit = 3 if user_type == "regular" else 5

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "user_type": self.user_type,
            "borrowed_books": list(self.borrowed_books),
            "borrow_limit": self.borrow_limit
        }

class Book:
    def __init__(self, book_id, title, author, isbn, available=True):
        self.book_id = book_id
        self.title = title
        self.author = author
        self.isbn = isbn
        self.available = available

    def to_dict(self):
        return {
            "book_id": self.book_id,
            "title": self.title,
            "author": self.author,
            "isbn": self.isbn,
            "available": self.available
        }


# class Loan:
#     def __init__(self, book_id, user_id, due_date):
#         self.book_id = book_id
#         self.user_id = user_id
#         self.due_date = due_date

#     def to_dict(self):
#         return {
#             "book_id": self.book_id,
#             "user_id": self.user_id,
#             "due_date": self.due_date.isoformat()
#         }



class Loan:
    def __init__(self, book_id, user_id):
        self.book_id = book_id
        self.user_id = user_id
        self.borrow_date = datetime.now()
        self.due_date = self.borrow_date + timedelta(days=30)

    def to_dict(self):
        return {
            "book_id": self.book_id,
            "user_id": self.user_id,
            "borrow_date": self.borrow_date.isoformat(),
            "due_date": self.due_date.isoformat()
        }
