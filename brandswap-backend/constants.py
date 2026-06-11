# BrandSwap Core Constants

SEARCH_REGIONS = {
    "bottom-right": {"x_offset": 0, "y_offset": 0},  # Default/Bottom Right
    "bottom-left": {"x_offset": 10, "y_offset": 0}, # Padding left
    "top-right": {"x_offset": 0, "y_offset": 8},   # Padding top
    "top-left": {"x_offset": 10, "y_offset": 8}     # Padding top-left
}

OVERLAY_STYLE = {
    "background_color": (15, 23, 42, 230), # Dark blue/black with transparency
    "text_color": (255, 255, 255, 255),   # White text
    "border_color": (59, 130, 246, 255),  # Blue border for consistency
    "border_width": 2,
}

# Scaling factors for logo size estimation relative to image dimensions
LOGO_SIZE_ESTIMATES = {
    "default_w_ratio": 0.18, # Default width ratio (used in video agent)
    "default_h_ratio": 0.3,  # Approximate aspect ratio height
}

# Standardized Bounding Box Format: (x, y, width, height)
BBOX_FORMAT = "xywh"