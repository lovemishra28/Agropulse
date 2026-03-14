from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta
from app.database import recommendation_history_collection

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
    query = {}
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query["timestamp"] = {"$gte": since}

    history = list(
        recommendation_history_collection.find(
            query,
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit)
    )

    return {"history": history, "count": len(history)}
