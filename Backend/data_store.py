from models import User, Book, Loan
from datetime import datetime, timedelta

users = {
    1: User(1, "anil", "123", "anil@example.com", "regular"),
    2: User(2, "manyam", "456", "manyam@example.com", "librarian")
}

# sample books
books = {
    1: Book(1, "One Indian Girl", "Chethan Bhagat", "9780134494166"),
    2: Book(2, "Design Patterns", "Gamma et al.", "9780201633610"),
    3: Book(3, "Refactoring", "Martin Fowler", "9780201485677"),
    4: Book(4, "The Pragmatic Programmer", "Andrew Hunt and David Thomas", "9780135957059"),
    5: Book(5, "Introduction to Algorithms", "Thomas H. Cormen et al.", "9780262033848"),
    6: Book(6, "Artificial Intelligence: A Modern Approach", "Stuart Russell and Peter Norvig", "9780134610996"),
    7: Book(7, "Clean Architecture", "Robert C. Martin", "9780136083238"),
    8: Book(8, "3 mistakes of my life", "Chethan Bhagat", "9780062358301")
}

loans = {
    # initially no active loans
}

loan_history = []
user_fines = {}  


def get_next_user_id():
    return max(users.keys(), default=0) + 1

def get_next_book_id():
    return max(books.keys(), default=0) + 1

def get_due_date():
    return datetime.now() + timedelta(days=14)
