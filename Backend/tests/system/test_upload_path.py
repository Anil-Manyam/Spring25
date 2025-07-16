import os
import io
import pytest
from app import app


@pytest.fixture
def client():
    with app.test_client() as c:
        yield c


def test_upload_file_and_add_book(client, monkeypatch):
    # Setup fake file to upload
    data = {
        "title": "Upload Book",
        "author": "Author",
        "isbn": "1234567890",
        "description": "Test file upload",
        "file": (io.BytesIO(b"dummy image data"), "cover.jpg"),
    }

    # Patch book_service to avoid DB access
    def fake_add_book(data):
        return {
            "title": data["title"],
            "author": data["author"],
            "isbn": data["isbn"],
            "description": data["description"],
            "imageUrl": data.get("imageUrl", "")
        }

    monkeypatch.setattr("app.book_service.add_book", fake_add_book)

    response = client.post("/api/books", data=data, content_type="multipart/form-data")
    assert response.status_code == 201
    assert "Upload Book" in response.get_data(as_text=True)

    # Verify file was saved (optional cleanup below if desired)
    upload_folder = os.path.join(app.root_path, "static", "uploads")
    uploaded_files = os.listdir(upload_folder)
    assert any(f.startswith("cover") and f.endswith(".jpg") for f in uploaded_files)
