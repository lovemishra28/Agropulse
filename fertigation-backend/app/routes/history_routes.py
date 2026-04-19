from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from pymongo.errors import PyMongoError
from app.database import (
    recommendation_history_collection,
    is_database_available,
    DB_UNAVAILABLE_MESSAGE,
)

router = APIRouter(tags=["History"])


@router.get("/recommendation-history")
def get_recommendation_history(
    hours: Optional[int] = Query(None, description="Filter by last N hours"),
    limit: int = Query(50, description="Max records to return"),
):
    """
    Returns logged recommendation history from MongoDB.
    Optionally filter by last N hours.
    """
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    query = {}
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query["timestamp"] = {"$gte": since}

    try:
        history = list(
            recommendation_history_collection.find(
                query,
                {"_id": 0}
            ).sort("timestamp", -1).limit(limit)
        )
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    return {"history": history, "count": len(history)}
