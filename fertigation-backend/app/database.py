import os
from pymongo import MongoClient
from dotenv import load_dotenv

# This loads the variables from your .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# This creates the connection client
client = MongoClient(MONGO_URI)

# This creates (or connects to) your specific database
db = client[DATABASE_NAME]

# These are your 'collections' (like tables in SQL)
sensor_collection = db["sensor_data"]
crop_collection = db["crop_profiles"]
fertigation_history_collection = db["fertigation_history"]
recommendation_history_collection = db["recommendation_history"]