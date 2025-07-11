from icontract import require, ensure
from pymongo import MongoClient
from bson import ObjectId

client = MongoClient("mongodb+srv://lmsuser:Chathura630@lmscluster.icwol0u.mongodb.net/?retryWrites=true&w=majority&appName=LMSCluster")
db = client['lmsdb']
users_col = db['users']

class UserService:

    @require(lambda username: isinstance(username, str) and len(username) > 0)
    @require(lambda password: isinstance(password, str) and len(password) > 0)
    @require(lambda confirm_password: isinstance(confirm_password, str) and len(confirm_password) > 0)
    @require(lambda email: isinstance(email, str) and len(email) > 0)
    @require(lambda user_type: isinstance(user_type, str))
    @ensure(lambda result: isinstance(result, dict))
    def register(self, username, password, confirm_password, email, user_type="regular"):
        if password != confirm_password:
            raise ValueError("Passwords do not match")

        if users_col.find_one({"username": username}):
            raise ValueError("Username already exists")

        user_doc = {
            "username": username,
            "password": password,
            "email": email,
            "user_type": user_type,
            "borrowed_books": []
        }
        result = users_col.insert_one(user_doc)
        user_doc["user_id"] = str(result.inserted_id)
        user_doc.pop("_id", None)
        return user_doc

    @require(lambda username: isinstance(username, str) and len(username) > 0)
    @require(lambda password: isinstance(password, str) and len(password) > 0)
    @ensure(lambda result: isinstance(result, dict))
    def login(self, username, password):
        user = users_col.find_one({"username": username})
        if not user:
            raise ValueError("Username not found")
        if user["password"] != password:
            raise ValueError("Incorrect password")
    
        user["user_id"] = str(user["_id"])
        del user["_id"]

        return user

    @require(lambda user_id: isinstance(user_id, str) and len(user_id) > 0)
    @ensure(lambda result: isinstance(result, dict))
    def get_user(self, user_id):
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError("User not found")
    
        user["user_id"] = str(user["_id"])
        del user["_id"]

        return user
