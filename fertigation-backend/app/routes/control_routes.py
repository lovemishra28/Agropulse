from fastapi import APIRouter
from datetime import datetime
from app.database import fertigation_history_collection

router = APIRouter()

@router.post("/fertigate")
def start_fertigation():

    log = {
        "action": "fertigation_started",
        "timestamp": datetime.utcnow()
    }

    # Persist to MongoDB instead of in-memory list
    fertigation_history_collection.insert_one(log)

    return {
        "status": "Fertigation started",
        "timestamp": log["timestamp"]
    }


@router.get("/fertigation-history")
def get_fertigation_history():

    # Fetch from MongoDB, sorted by most recent first, removing the _id field
    history = list(
        fertigation_history_collection.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1)
    )

    return {
        "history": history
    }