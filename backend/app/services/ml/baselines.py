import logging

logger = logging.getLogger(__name__)

def baseline_bilinear(coarse_grid, target_resolution="1km"):
    """Applies basic bilinear interpolation to downscale the forecast."""
    logger.info("Running Bilinear interpolation baseline.")
    # e.g., scipy.interpolate or xarray interp
    return {"status": "success", "method": "bilinear"}

def baseline_bicubic(coarse_grid, target_resolution="1km"):
    """Applies basic bicubic interpolation."""
    logger.info("Running Bicubic interpolation baseline.")
    return {"status": "success", "method": "bicubic"}
