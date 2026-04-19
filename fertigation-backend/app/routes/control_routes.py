from fastapi import APIRouter, HTTPException
from datetime import datetime
from pymongo.errors import PyMongoError
from app.database import (
    fertigation_history_collection,
    is_database_available,
    DB_UNAVAILABLE_MESSAGE,
)

router = APIRouter()

@router.post("/fertigate")
def start_fertigation():
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    log = {
        "action": "fertigation_started",
        "timestamp": datetime.utcnow()
    }

    # Persist to MongoDB instead of in-memory list
    try:
        fertigation_history_collection.insert_one(log)
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    return {
        "status": "Fertigation started",
        "timestamp": log["timestamp"]
    }


@router.get("/fertigation-history")
def get_fertigation_history():
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    # Fetch from MongoDB, sorted by most recent first, removing the _id field
    try:
        history = list(
            fertigation_history_collection.find(
                {},
                {"_id": 0}
            ).sort("timestamp", -1)
        )
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    return {
        "history": history
    }