# # lms_backend/services/book_service.py

# from icontract import require, ensure
# from data_store import books, get_next_book_id
# from models import Book

# class BookService:

#     @require(lambda data: isinstance(data, dict))
#     @ensure(lambda result: isinstance(result, dict))
#     def add_book(self, data):
#         title = data.get("title")
#         author = data.get("author")
#         isbn = data.get("isbn")

#         if not title or not author or not isbn:
#             raise ValueError("Missing book information")

#         for b in books.values():
#             if b.isbn == isbn:
#                 raise ValueError("ISBN already exists")

#         bid = get_next_book_id()
#         new_book = Book(bid, title, author, isbn)
#         books[bid] = new_book
#         return new_book.to_dict()


#     def list_books(self):
#         return [b.to_dict() for b in books.values()]

#     @require(lambda book_id: isinstance(book_id, int) and book_id > 0)
#     def remove_book(self, book_id):
#         if book_id not in books:
#             raise ValueError("Book not found")
#         if not books[book_id].available:
#             raise ValueError("Cannot remove a borrowed book")
#         del books[book_id]

# lms_backend/services/book_service.py

from icontract import require, ensure
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

client = MongoClient("mongodb+srv://lmsuser:Chathura630@lmscluster.icwol0u.mongodb.net/?retryWrites=true&w=majority&appName=LMSCluster")
db = client['lmsdb']
books_col = db['books']
feedback_col = db['book_feedback']

class BookService:

    @require(lambda data: isinstance(data, dict))
    @ensure(lambda result: isinstance(result, dict))
    def add_book(self, data):
        title = data.get("title")
        author = data.get("author")
        isbn = data.get("isbn")
        imageUrl = data.get("imageUrl")  
        description = data.get("description")  

        if not title or not author or not isbn:
            raise ValueError("Missing book information")

        if books_col.find_one({"isbn": isbn}):
            raise ValueError("ISBN already exists")

        book_doc = {
            "title": title,
            "author": author,
            "isbn": isbn,
            "available": True,
            "description": data.get("description", ""),
            "imageUrl": data.get("imageUrl", "")
        }

        result = books_col.insert_one(book_doc)
        book_doc["book_id"] = str(result.inserted_id)
        book_doc.pop("_id", None)  
        return book_doc

    def list_books(self):
        books = list(books_col.find({}))
        for b in books:
            b["book_id"] = str(b["_id"])
            b.pop("_id", None)
        return books

    @require(lambda book_id: isinstance(book_id, str) and len(book_id) > 0)
    def remove_book(self, book_id):
        book = books_col.find_one({"_id": ObjectId(book_id)})
        if not book:
            raise ValueError("Book not found")
        if not book["available"]:
            raise ValueError("Cannot remove a borrowed book")
        books_col.delete_one({"_id": ObjectId(book_id)})

    
    def add_feedback(self, book_id: str, user_id: str, username: str, feedback: str):
        """
        Adds feedback for a book after return.
        """
        if not feedback.strip():
            return  # if empty, do nothing
        feedback_doc = {
            "book_id": book_id,
            "user_id": user_id,
            "username": username,
            "feedback": feedback,
            "date": datetime.now()
        }
        feedback_col.insert_one(feedback_doc)

    def get_feedback(self, book_id: str):
        """
        Gets all feedback for a book.
        """
        feedbacks = list(feedback_col.find({"book_id": book_id}))
        for f in feedbacks:
            f["feedback_id"] = str(f["_id"])
            f.pop("_id", None)
        return feedbacks
    
    @require(lambda book_id: isinstance(book_id, str) and len(book_id) > 0)
    @require(lambda data: isinstance(data, dict))
    def update_book(self, book_id, data):
        allowed_fields = {"title", "author", "isbn", "imageUrl", "description"}
        update_data = {k: v for k, v in data.items() if k in allowed_fields and str(v).strip()}
        if not update_data:
            raise ValueError("No valid fields to update.")

        result = books_col.update_one(
            {"_id": ObjectId(book_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise ValueError("Book not found")


