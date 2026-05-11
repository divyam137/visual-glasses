import json
import os
import math
# File used to persist simple user interaction feedback/feedback_loop.
STORE_FILE = "feedback_store.json"

# Load previously stored click data (if available) so that
# popularity signals survive server restarts.
if os.path.exists(STORE_FILE):
    with open(STORE_FILE, "r") as f:
        CLICK_COUNTS = json.load(f)
else:
    CLICK_COUNTS = {}
def record_click(pid: int):
    key = str(pid)
    if key not in CLICK_COUNTS:
        CLICK_COUNTS[key] = 0
    CLICK_COUNTS[key] += 1
    with open(STORE_FILE, "w") as f:
        json.dump(CLICK_COUNTS, f, indent=2)


def get_boost(pid: int) -> float:
    """
    Returns a small ranking boost based on how often a product is clicked.The boost is intentionally capped so that popularity does not completely overpower relevance-based ranking in search/recommendation results.
    """
    clicks = CLICK_COUNTS.get(str(pid), 0)

    # smooth logarithmic boost based on click count took ai help here
    boost = math.log1p(clicks) * 0.1

    # Cap the maximum boost to keep rankings balanced
    return 1.0 + min(0.3, boost)
