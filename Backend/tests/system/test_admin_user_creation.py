# tests/system/test_admin_user_creation.py
from bson import ObjectId
from unittest.mock import MagicMock
import pytest
from app import app


@pytest.fixture
def make_client(monkeypatch):
    m_users = MagicMock()
    # patch everywhere
    monkeypatch.setattr("app.users_col", m_users)
    monkeypatch.setattr("services.user_service.users_col", m_users)

    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c, m_users


def test_admin_create_user_forbidden(make_client):
    client, _ = make_client
    # No header → 403
    res = client.post("/api/admin/users", json={"username": "x"})
    assert res.status_code == 403


def test_admin_create_user_success(make_client):
    client, m_users = make_client
    admin_id = str(ObjectId())
    # make header user a librarian
    m_users.find_one.side_effect = lambda q: {
        "_id": ObjectId(admin_id), "user_type": "librarian"
    } if q.get("_id") == ObjectId(admin_id) else None
    m_users.insert_one.return_value.inserted_id = ObjectId()

    res = client.post(
        "/api/admin/users",
        headers={"X-User-Id": admin_id},
        json={"username": "newu", "email": "n@x.com", "password": "pw"}
    )
    assert res.status_code == 201
