import logging
from .models.unet import initialize_model, run_inference
from .calibration import apply_local_calibration
from .consistency import apply_consistency_constraint
from .reliability import calculate_reliability

logger = logging.getLogger(__name__)

def run_downscaling_pipeline(coarse_forecast_run, context_features, station_observations):
    """
    Workflow 2 - Downscaling
    End-to-End inference pipeline combining ML downscaling, calibration, 
    consistency constraints, and uncertainty estimation.
    """
    logger.info(f"Starting Downscaling Pipeline for run {coarse_forecast_run.get('id')}")
    
    # 1. Load ML Model
    model = initialize_model()
    
    # 2. Run SUKSHMA U-Net Downscaling
    fine_grid = run_inference(model, coarse_forecast_run['data'], context_features)
    
    # 3. Apply Local Calibration (Workflow 3)
    calibrated_grid = apply_local_calibration(fine_grid, station_observations)
    
    # 4. Consistency Constraint
    consistency_result = apply_consistency_constraint(calibrated_grid, coarse_forecast_run['data'])
    if not consistency_result["passed"]:
        logger.warning(f"Consistency check failed with error {consistency_result['consistency_error']}")
        # Handle failure (e.g., fallback to baselines)
        
    # 5. Reliability / Uncertainty (Workflow 5)
    data_freshness_hours = 2 # Example
    reliability_data = calculate_reliability(calibrated_grid, len(station_observations), data_freshness_hours)
    
    logger.info("Downscaling Pipeline completed successfully.")
    
    return {
        "status": "success",
        "final_grid": calibrated_grid,
        "reliability": reliability_data,
        "consistency": consistency_result
    }
