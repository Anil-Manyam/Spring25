from icontract import require
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta

client = MongoClient("mongodb+srv://lmsuser:Chathura630@lmscluster.icwol0u.mongodb.net/?retryWrites=true&w=majority&appName=LMSCluster")
db = client['lmsdb']
books_col = db['books']
users_col = db['users']
loans_col = db['loans']
history_col = db['loan_history']
user_fines_col = db['user_fines']

def get_user_outstanding_fine(user_id):
    # check stored fines first
    fine_doc = user_fines_col.find_one({"user_id": user_id})
    if fine_doc:
        return fine_doc["amount"]

    # else calculate from loans
    total_fine = 0
    today = datetime.now()
    for loan in loans_col.find({"user_id": user_id}):
        if today > loan["due_date"]:
            overdue_days = (today - loan["due_date"]).days
            total_fine += overdue_days
    return total_fine

class LoanService:

    @require(lambda user_id: isinstance(user_id, str) and len(user_id) > 0)
    @require(lambda book_id: isinstance(book_id, str) and len(book_id) > 0)
    def borrow_book(self, user_id, book_id):
        # block borrow if outstanding fine
        if get_user_outstanding_fine(user_id) > 0:
            raise ValueError("You have unpaid fines. Please pay them before borrowing books.")

        user = users_col.find_one({"_id": ObjectId(user_id)})
        book = books_col.find_one({"_id": ObjectId(book_id)})

        if not book or not book["available"]:
            raise ValueError("Book not available")

        if len(user.get("borrowed_books", [])) >= 3:
            raise ValueError("Borrowing limit reached. Return a book before borrowing another.")

        # mark unavailable
        books_col.update_one({"_id": ObjectId(book_id)}, {"$set": {"available": False}})

        # update user's borrowed_books
        users_col.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"borrowed_books": book_id}}
        )

        loan_doc = {
            "user_id": user_id,
            "book_id": book_id,
            "borrow_date": datetime.now(),
            "due_date": datetime.now() + timedelta(days=30)
        }
        loans_col.insert_one(loan_doc)

    @require(lambda user_id: isinstance(user_id, str) and len(user_id) > 0)
    @require(lambda book_id: isinstance(book_id, str) and len(book_id) > 0)
    def return_book(self, user_id, book_id):
        # block return if outstanding fine
        if get_user_outstanding_fine(user_id) > 0:
            raise ValueError("You have unpaid fines. Please pay them before returning books.")

        loan = loans_col.find_one({"user_id": user_id, "book_id": book_id})
        if not loan:
            raise ValueError("This book was not borrowed by the user")

        book = books_col.find_one({"_id": ObjectId(book_id)})
        if not book:
            raise ValueError("Book record missing")

        # mark book available
        books_col.update_one({"_id": ObjectId(book_id)}, {"$set": {"available": True}})

        # update user's borrowed_books
        users_col.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"borrowed_books": book_id}}
        )

        today = datetime.now()
        fine = 0
        if today > loan["due_date"]:
            overdue_days = (today - loan["due_date"]).days
            fine = overdue_days * 1

        history_col.insert_one({
            "book_id": book_id,
            "book_title": book["title"],
            "book_isbn": book["isbn"],
            "user_id": user_id,
            "borrow_date": loan["borrow_date"],
            "return_date": today
        })

        loans_col.delete_one({"_id": loan["_id"]})
        return {"fine": fine}

    def get_all_loans(self):
        loans = list(loans_col.find({}))
        result = []
        for loan in loans:
            user = users_col.find_one({"_id": ObjectId(loan["user_id"])})
            book = books_col.find_one({"_id": ObjectId(loan["book_id"])})
            result.append({
                "title": book["title"] if book else "Unknown",
                "isbn": book["isbn"] if book else "Unknown",
                "user_id": loan["user_id"],
                "username": user["username"] if user else "unknown",
                "borrow_date": loan["borrow_date"].isoformat(),
                "due_date": loan["due_date"].isoformat()
            })
        return result



# # lms_backend/services/loan_service.py

# from icontract import require
# from pymongo import MongoClient
# from bson import ObjectId
# from datetime import datetime, timedelta

# # client = MongoClient("mongodb+srv://anilmanyam630:gIWrvDZw0aRNOOXA@lmscluster.icwol0u.mongodb.net/?retryWrites=true&w=majority&appName=LMSCluster")
# client = MongoClient("mongodb+srv://lmsuser:Chathura630@lmscluster.icwol0u.mongodb.net/?retryWrites=true&w=majority&appName=LMSCluster")
# db = client['lmsdb']
# books_col = db['books']
# users_col = db['users']
# loans_col = db['loans']
# history_col = db['loan_history']

# class LoanService:

#     @require(lambda user_id: isinstance(user_id, str) and len(user_id) > 0)
#     @require(lambda book_id: isinstance(book_id, str) and len(book_id) > 0)
#     def borrow_book(self, user_id, book_id):
#         user = users_col.find_one({"_id": ObjectId(user_id)})
#         book = books_col.find_one({"_id": ObjectId(book_id)})

#         if not book or not book["available"]:
#             raise ValueError("Book not available")

#         if len(user.get("borrowed_books", [])) >= 3:
#             raise ValueError("Borrowing limit reached. Return a book before borrowing another.")

#         # mark unavailable
#         books_col.update_one({"_id": ObjectId(book_id)}, {"$set": {"available": False}})

#         # update user's borrowed_books
#         users_col.update_one(
#             {"_id": ObjectId(user_id)},
#             {"$push": {"borrowed_books": book_id}}
#         )

#         loan_doc = {
#             "user_id": user_id,
#             "book_id": book_id,
#             "borrow_date": datetime.now(),
#             "due_date": datetime.now() + timedelta(days=30)
#         }
#         loans_col.insert_one(loan_doc)

#     @require(lambda user_id: isinstance(user_id, str) and len(user_id) > 0)
#     @require(lambda book_id: isinstance(book_id, str) and len(book_id) > 0)
#     def return_book(self, user_id, book_id):
#         loan = loans_col.find_one({"user_id": user_id, "book_id": book_id})
#         if not loan:
#             raise ValueError("This book was not borrowed by the user")

#         # fix: fetch the book
#         book = books_col.find_one({"_id": ObjectId(book_id)})
#         if not book:
#             raise ValueError("Book record missing")

#         # mark book available
#         books_col.update_one({"_id": ObjectId(book_id)}, {"$set": {"available": True}})

#         # update user's borrowed_books
#         users_col.update_one(
#             {"_id": ObjectId(user_id)},
#             {"$pull": {"borrowed_books": book_id}}
#         )

#         today = datetime.now()
#         fine = 0
#         if today > loan["due_date"]:
#             overdue_days = (today - loan["due_date"]).days
#             fine = overdue_days * 1

#         # store in loan history
#         history_col.insert_one({
#             "book_id": book_id,
#             "book_title": book["title"],
#             "book_isbn": book["isbn"],
#             "user_id": user_id,
#             "borrow_date": loan["borrow_date"],
#             "return_date": today
#         })

#         loans_col.delete_one({"_id": loan["_id"]})
#         return {"fine": fine}


#     def get_all_loans(self):
#         loans = list(loans_col.find({}))
#         result = []
#         for loan in loans:
#             user = users_col.find_one({"_id": ObjectId(loan["user_id"])})
#             book = books_col.find_one({"_id": ObjectId(loan["book_id"])})
#             result.append({
#                 "title": book["title"] if book else "Unknown",
#                 "isbn": book["isbn"] if book else "Unknown",
#                 "user_id": loan["user_id"],
#                 "username": user["username"] if user else "unknown",
#                 "borrow_date": loan["borrow_date"].isoformat(),
#                 "due_date": loan["due_date"].isoformat()
#             })
#         return result

