import os
from pymongo import MongoClient
from dotenv import load_dotenv

DB_UNAVAILABLE_MESSAGE = (
	"MongoDB is not reachable. Start MongoDB on localhost:27017 "
	"or set a valid MONGO_URI in fertigation-backend/.env"
)

# This loads the variables from your .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "agropulse")

# This creates the connection client
client = MongoClient(
	MONGO_URI,
	serverSelectionTimeoutMS=3000,
	connectTimeoutMS=3000,
)

# This creates (or connects to) your specific database
db = client[DATABASE_NAME]

# These are your 'collections' (like tables in SQL)
sensor_collection = db["sensor_data"]
crop_collection = db["crop_profiles"]
fertigation_history_collection = db["fertigation_history"]
recommendation_history_collection = db["recommendation_history"]


def is_database_available() -> bool:
	"""Checks whether MongoDB is reachable without crashing request handlers."""
	try:
		client.admin.command("ping")
		return True
	except Exception:
		return False