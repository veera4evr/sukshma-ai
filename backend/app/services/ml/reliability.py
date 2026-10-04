import logging

logger = logging.getLogger(__name__)

def calculate_reliability(fine_grid, observation_availability, data_freshness_hours):
    """
    Estimates the reliability and prediction uncertainty interval.
    Combines:
    - Model uncertainty (e.g., from ensemble spread or dropout)
    - Observation availability nearby
    - Recent data freshness
    """
    logger.info("Calculating reliability score and prediction intervals.")
    
    # Placeholder logic
    base_reliability = 0.85
    penalty = (data_freshness_hours / 24) * 0.1
    final_score = max(0.1, base_reliability - penalty)
    
    level = "High" if final_score >= 0.75 else ("Medium" if final_score >= 0.58 else "Low")
    
    return {
        "status": "success",
        "reliability_score": final_score,
        "level": level,
        "prediction_interval": [fine_grid * 0.9, fine_grid * 1.1] # Mock interval
    }
