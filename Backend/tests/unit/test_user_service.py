# import unittest
# from Backend.services import user_service as svc

# class TestUserService(unittest.TestCase):
#     def setUp(self):
#         svc.users.clear()

#     def test_register_user_regular(self):
#         u = svc.register_user("ken", "regular")
#         self.assertEqual(u.user_type, "regular")

#     def test_register_user_librarian(self):
#         u = svc.register_user("linda", "librarian")
#         self.assertEqual(u.borrow_limit, 5)

#     def test_get_user_found(self):
#         u = svc.register_user("max", "regular")
#         self.assertEqual(svc.get_user(u.user_id).username, "max")

#     def test_get_user_not_found(self):
#         self.assertIsNone(svc.get_user(404))

# tests/test_user_service.py

import pytest
from unittest.mock import MagicMock
from services.user_service import UserService

@pytest.fixture(autouse=True)
def mock_users_col(monkeypatch):
    """
    Replaces `users_col` inside user_service module with a fresh MagicMock
    for every test. All CRUD calls go to this mock instead of MongoDB.
    """
    mock_users = MagicMock(name="users_col")

    # Patch the module-level collection used by UserService methods
    monkeypatch.setattr("services.user_service.users_col", mock_users)

    # Default behaviour ─ username lookup returns None (user does not exist)
    mock_users.find_one.return_value = None
    # Simulate insert_one returning a fake ObjectId
    mock_users.insert_one.return_value.inserted_id = "mock_id_1"

    yield mock_users   # provide mock to tests


# Create a single service instance for all tests
svc = UserService()


def test_register_user_regular(mock_users_col):
    """
    Happy path: register a regular user.
    """
    user_doc = svc.register(
        username="ken",
        password="pw",
        confirm_password="pw",
        email="ken@example.com",
        user_type="regular"
    )
    assert user_doc["user_type"] == "regular"
    mock_users_col.insert_one.assert_called_once()


def test_register_user_librarian(mock_users_col):
    user_doc = svc.register(
        "linda", "pw", "pw", "linda@example.com", "librarian"
    )
    assert user_doc["user_type"] == "librarian"
    mock_users_col.insert_one.assert_called_once()


def test_register_duplicate_username(mock_users_col):
    """
    When username already exists, ValueError is raised.
    """
    # Make find_one pretend the username already exists
    mock_users_col.find_one.return_value = {"username": "alice"}
    with pytest.raises(ValueError, match="Username already exists"):
        svc.register("alice", "pw", "pw", "a@x.com", "regular")


def test_get_user_found(mock_users_col):
    """
    get_user returns hydrated dict when user exists.
    """
    from bson import ObjectId
    fake_id = ObjectId("64b9eaf7f2e4b1e31407aa3e")

    mock_users_col.find_one.return_value = {
        "_id": fake_id,
        "username": "max",
        "password": "pw",
        "email": "m@x.com",
        "user_type": "regular",
        "borrowed_books": []
    }

    user = svc.get_user(str(fake_id))
    assert user["username"] == "max"
    mock_users_col.find_one.assert_called_once()


def test_get_user_not_found(mock_users_col):
    """
    get_user should raise ValueError if user does not exist.
    """
    mock_users_col.find_one.return_value = None
    with pytest.raises(ValueError, match="User not found"):
        svc.get_user("64b9eaf7f2e4b1e31407fffe")   # random valid ObjectId


def test_login_incorrect_password(mock_users_col):
    """
    login raises ValueError when password mismatch.
    """
    mock_users_col.find_one.return_value = {
        "_id": "uid1",
        "username": "bob",
        "password": "secret",
        "user_type": "regular",
    }
    with pytest.raises(ValueError, match="Incorrect password"):
        svc.login("bob", "wrongpw")
