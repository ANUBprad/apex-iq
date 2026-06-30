from fastapi import APIRouter, Depends, Query
from backend.app.api.deps import get_aggregator_service
from backend.app.domains.dashboard.service import DashboardAggregatorService
from backend.app.api.schemas.dashboard import (
    DashboardAggregateResponse,
    DashboardAggregateRequest
)

router = APIRouter()

@router.get("/session-summary", response_model=DashboardAggregateResponse)
async def get_session_summary(
    circuit_id: str = Query(..., description="Circuit slug"),
    driver_id: str = Query(..., description="Driver slug"),
    compound: str = Query(..., description="Current tyre compound"),
    tyre_age: int = Query(..., ge=0),
    laps_remaining: int = Query(..., ge=1),
    current_position: int = Query(5, ge=1, le=20),
    iterations: int = Query(1000, ge=100, le=10000),
    aggregator: DashboardAggregatorService = Depends(get_aggregator_service)
):
    """
    Unified Dashboard Aggregator (V2).
    
    Fetches driver profile, team DNA, strategy recommendations, and 
    historical analysis in a single parallelized request.
    """
    params = DashboardAggregateRequest(
        circuit_id=circuit_id,
        driver_id=driver_id,
        compound=compound,
        tyre_age=tyre_age,
        laps_remaining=laps_remaining,
        current_position=current_position,
        iterations=iterations
    )
    
    return await aggregator.get_dashboard_payload(params)
