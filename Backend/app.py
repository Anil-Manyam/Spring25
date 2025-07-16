from flask import Flask, jsonify, request
from services.user_service import UserService
from services.book_service import BookService
from services.loan_service import LoanService, history_col
from flask_cors import CORS
from datetime import datetime, timezone
from data_store import loans, loan_history, user_fines
from pymongo import MongoClient
from bson import ObjectId
import os
from werkzeug.utils import secure_filename
from flask import request, jsonify, g
from bson import ObjectId
from services import user_service
from functools import wraps
from flask import session


app = Flask(__name__)
# CORS(app)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# create instances of services
user_service = UserService()
book_service = BookService()
loan_service = LoanService()


#client = MongoClient("mongodb+srv://anilmanyam630:gIWrvDZw0aRNOOXA@lmscluster.icwol0u.mongodb.net/?retryWrites=true&w=majority&appName=LMSCluster")
client = MongoClient("mongodb+srv://lmsuser:Chathura630@lmscluster.icwol0u.mongodb.net/?retryWrites=true&w=majority&appName=LMSCluster")
db = client['lmsdb']

# collections
users_col = db['users']
books_col = db['books']
loans_col = db['loans']

UPLOAD_FOLDER = os.path.join(app.root_path, "static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXT = {"png", "jpg", "jpeg", "gif"}

def allowed_file(fname):
    return "." in fname and fname.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not g.current_user or g.current_user.get("user_type") != "librarian":
            return jsonify({"error": "Admin only"}), 403
        return f(*args, **kwargs)
    return wrapper



@app.before_request
def load_current_user():
    """
    Middleware that sets g.current_user from a header (or session, cookie, etc.)
    This is a placeholder. Replace with real session-based auth in production.
    """
    user_id = request.headers.get("X-User-Id")  # sent from frontend
    if user_id:
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            g.current_user = user
            return  # OK
    g.current_user = None

# ------------------ USER ROUTES ------------------
@app.route('/api/users/login', methods=['POST'])
def login_user():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    try:
        user = user_service.login(username, password)
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/users/register', methods=['POST'])
def register_user():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    confirm_password = data.get("confirm_password")
    email = data.get("email")
    user_type = data.get("user_type", "regular")
    try:
        user = user_service.register(username, password, confirm_password, email, user_type)
        return jsonify(user), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = user_service.get_user(user_id)
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route("/api/admin/users", methods=["GET"])
@admin_required
def api_list_users():
    """
    Return every user document except the password field.
    Called by the React admin table.
    """
    users = list(users_col.find({}, {"password": 0}))
    for u in users:
        u["_id"] = str(u["_id"])          # make ObjectId JSON-friendly
    return jsonify(users)

@app.route("/api/admin/users", methods=["POST"])
@admin_required
def api_create_user():
    data = request.json or {}
    try:
        username   = data["username"].strip()
        email      = data["email"].strip()
        password   = data["password"]
        full_name  = data.get("full_name", "")

        if users_col.find_one({"username": username}):
            return jsonify({"error": "Username already exists"}), 400

        user_doc = {
            "username":  username,
            "email":     email,
            "password":  password,               
            "full_name": full_name,
            "user_type": "regular",              
            "created_at": datetime.now(timezone.utc)
        }
        result = users_col.insert_one(user_doc)
        return jsonify({"user_id": str(result.inserted_id)}), 201

    except (KeyError, ValueError) as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/admin/users/<user_id>", methods=["DELETE"])
@admin_required
def api_delete_user(user_id):
    """
    Delete a regular user.  Prevent deleting librarians.
    """
    res = users_col.delete_one(
        {"_id": ObjectId(user_id), "user_type": {"$ne": "librarian"}}
    )
    if res.deleted_count:
        return "", 204
    return jsonify({"error": "User not found or cannot delete librarian"}), 404

# ------------------ BOOK ROUTES ------------------


@app.route('/api/books', methods=['GET'])
def list_books():
    books_data = book_service.list_books()
    return jsonify(books_data)

@app.route('/api/books', methods=['POST'])
def add_book():
    # use form-data: title, author, isbn, description, file
    data = request.form
    file = request.files.get("file")

    if file and allowed_file(file.filename):
        fname = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, fname)
        # guarantee unique filename
        counter = 1
        while os.path.exists(save_path):
            fname = f"{counter}_{secure_filename(file.filename)}"
            save_path = os.path.join(UPLOAD_FOLDER, fname)
            counter += 1
        file.save(save_path)
        image_path = f"http://127.0.0.1:5000/static/uploads/{fname}"
    else:
        image_path = ""

    try:
        book = book_service.add_book(
            {
                "title": data.get("title"),
                "author": data.get("author"),
                "isbn": data.get("isbn"),
                "description": data.get("description"),
                "imageUrl": image_path
            }
        )
        return jsonify(book), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400



@app.route('/api/books/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        book_service.remove_book(str(book_id))
        return jsonify({"message": "Book removed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/books/<book_id>', methods=['PATCH'])
def update_book(book_id):
    data = request.form
    file = request.files.get("file")
    update_dict = dict(data)  

    if file and allowed_file(file.filename):
        fname = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, fname)
        counter = 1
        while os.path.exists(save_path):
            fname = f"{counter}_{secure_filename(file.filename)}"
            save_path = os.path.join(UPLOAD_FOLDER, fname)
            counter += 1
        file.save(save_path)
        update_dict["imageUrl"] = f"/static/uploads/{fname}"

    try:
        book_service.update_book(book_id, update_dict)
        return jsonify({"message": "Book updated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ------------------ LOAN ROUTES ------------------

@app.route('/api/loans/borrow', methods=['POST'])
def borrow_book():
    data = request.json
    user_id = data.get("user_id")
    book_id = data.get("book_id")
    try:
        loan_service.borrow_book(user_id, book_id)
        return jsonify({"message": "Book borrowed successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/loans/return', methods=['POST'])
def return_book():
    data = request.json
    user_id = data.get("user_id")
    book_id = data.get("book_id")
    try:
        result = loan_service.return_book(user_id, book_id)
        return jsonify({"message": "Book returned", "fine": result["fine"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 400




@app.route('/api/loans/all', methods=['GET'])
def get_all_loans():
    try:
        loans_list = loan_service.get_all_loans()
        return jsonify(loans_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/loans/overdue', methods=['GET'])
def get_overdue():
    overdue = loan_service.get_overdue_loans()
    return jsonify(overdue)



@app.route('/api/users/<user_id>/fine', methods=['GET'])
def user_fine(user_id):
    try:
        # get active loans
        total_fine = 0
        for loan in loans_col.find({"user_id": user_id}):
            today = datetime.now()
            if today > loan["due_date"]:
                overdue_days = (today - loan["due_date"]).days
                total_fine += overdue_days

        # check any manually stored fines
        fine_doc = db['user_fines'].find_one({"user_id": user_id})
        stored_fine = fine_doc["amount"] if fine_doc else 0

        # final amount is the maximum of dynamic or stored
        final_fine = max(total_fine, stored_fine)

        print("user_id is", user_id)
        print("fine_doc found", fine_doc)
        return jsonify({"fine": final_fine})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/users/<user_id>/payfine', methods=['POST'])
def pay_fine(user_id):
    try:
        amount = request.json.get("amount", 0)
        if amount <= 0:
            return jsonify({"error": "Invalid amount."}), 400

        fine_doc = db['user_fines'].find_one({"user_id": user_id})
        if not fine_doc:
            return jsonify({"error": "No outstanding fine to pay."}), 400

        current_fine = fine_doc["amount"]
        remaining = current_fine - amount

        if remaining < 0:
            return jsonify({"error": f"You cannot overpay. Your fine is only ${current_fine}."}), 400

        db['user_fines'].update_one(
            {"user_id": user_id},
            {"$set": {"amount": remaining}}
        )

        return jsonify({"message": f"Payment of ${amount} accepted. Remaining fine: ${remaining}."})
    except Exception as e:
        return jsonify({"error": str(e)}), 400



@app.route('/api/users/<int:user_id>/history', methods=['GET'])
def user_history(user_id):
    try:
        user_loans = [h for h in loan_history if h['user_id'] == user_id]
        return jsonify(user_loans)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    



@app.route('/api/users/<user_id>/history', methods=['GET'])
def get_history(user_id):
    try:
        results = list(history_col.find({"user_id": user_id}))
        serialized = []
        for r in results:
            # fetch book details
            book = books_col.find_one({"_id": ObjectId(r["book_id"])})
            book_title = book["title"] if book else "Unknown"
            book_isbn = book["isbn"] if book else "Unknown"

            serialized.append({
                "history_id": str(r["_id"]),
                "title": book_title,
                "isbn": book_isbn,
                "borrow_date": r["borrow_date"].isoformat(),
                "return_date": r["return_date"].isoformat()
            })
        return jsonify(serialized)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ------ Feedback Routes ------

@app.route('/api/books/<book_id>/feedback', methods=['POST'])
def add_feedback(book_id):
    data = request.json
    user_id = data.get("user_id")
    username = data.get("username")
    feedback_text = data.get("feedback")

    try:
        book_service.add_feedback(book_id, user_id, username, feedback_text)
        return jsonify({"message": "Feedback saved."})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/books/<book_id>/feedback', methods=['GET'])
def get_feedback(book_id):
    try:
        fb = book_service.get_feedback(book_id)
        return jsonify(fb)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
