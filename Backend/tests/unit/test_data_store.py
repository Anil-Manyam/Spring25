# import unittest
# from data_store import generate_id, today_plus_days

# class TestDataFunctions(unittest.TestCase):
#     def test_generate_id_empty(self):
#         self.assertEqual(generate_id([]), 1)

#     def test_generate_id_increment(self):
#         lst = [{'id': 1}, {'id': 2}, {'id': 9}]
#         self.assertEqual(generate_id(lst), 10)

#     def test_today_plus_days_positive(self):
#         self.assertRegex(today_plus_days(7), r"\\d{4}-\\d{2}-\\d{2}")

#     def test_today_plus_days_zero(self):
#         self.assertEqual(today_plus_days(0), today_plus_days())

#     def test_today_plus_days_negative(self):
#         with self.assertRaises(ValueError):
#             today_plus_days(-1)




# import pytest
# from data_store import (
#     get_next_user_id,
#     get_next_book_id,
#     get_due_date,
#     users,
#     books,
# )

# def test_get_next_user_id_increment():
#     # current top ID is 2
#     assert get_next_user_id() == 3
#     users[3] = "dummy"        # simulate new user
#     assert get_next_user_id() == 4

# def test_get_next_book_id_increment():
#     # current top ID is 8
#     assert get_next_book_id() == 9
#     books[9] = "dummy"        # simulate new book
#     assert get_next_book_id() == 10

# def test_get_due_date_two_weeks_ahead():
#     from datetime import datetime, timedelta

#     due = get_due_date()
#     delta = due - datetime.now()
#     # allow a small tolerance (<2 sec) for compute time
#     assert timedelta(days=13, hours=23, minutes=59) < delta < timedelta(days=14, seconds=2)



import pytest
from data_store import (
    get_next_user_id,
    get_next_book_id,
    get_due_date,
    users,
    books,
)

# Fixture to isolate test changes to the global `users` dict
@pytest.fixture(autouse=True)
def clear_users_books():
    users.clear()
    users.update({
        1: "dummy1",
        2: "dummy2"
    })

    books.clear()
    books.update({
        1: "book1",
        2: "book2",
        3: "book3",
        4: "book4",
        5: "book5",
        6: "book6",
        7: "book7",
        8: "book8"
    })


def test_get_next_user_id_increment():
    assert get_next_user_id() == 3
    users[3] = "dummy3"
    assert get_next_user_id() == 4


def test_get_next_book_id_increment():
    assert get_next_book_id() == 9
    books[9] = "book9"
    assert get_next_book_id() == 10


def test_get_due_date_two_weeks_ahead():
    from datetime import datetime, timedelta

    due = get_due_date()
    now = datetime.now()
    delta = due - now

    # Allow small time tolerance (within 2 seconds)
    assert timedelta(days=13, hours=23, minutes=59) < delta < timedelta(days=14, seconds=2)
