"""
ML Prediction utility for Funding Readiness Score.

Loads the trained XGBoost/RandomForest pipeline once at module level,
and provides a function to predict funding readiness from a Profile.
"""

import os
import logging
import pandas as pd
import joblib

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model loading (singleton — loaded once when this module is first imported)
# ---------------------------------------------------------------------------

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "ml", "models", "funding_model.pkl"
)

_model = None


# Lazily loads the trained funding readiness machine learning model from disk into memory.
def _load_model():
    """Load the model lazily on first call."""
    global _model
    if _model is not None:
        return _model

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Funding prediction model not found at {MODEL_PATH}"
        )

    _model = joblib.load(MODEL_PATH)
    logger.info("Funding prediction model loaded successfully.")
    return _model


# ---------------------------------------------------------------------------
# Conversion constants
# ---------------------------------------------------------------------------

# 1 USD ≈ ₹83 → 1 Million USD = ₹83,00,000
INR_TO_MILLION_USD = 83_00_000


# ---------------------------------------------------------------------------
# Label & confidence helpers
# ---------------------------------------------------------------------------

# Maps a numerical funding readiness score into a standardized human-readable qualitative label.
def get_prediction_label(score: float) -> str:
    """Map a 0–100 score to a human-readable label."""
    if score >= 90:
        return "Outstanding"
    elif score >= 75:
        return "High"
    elif score >= 60:
        return "Moderate"
    elif score >= 40:
        return "Low"
    else:
        return "Very Low"


# Maps the machine learning model's statistical confidence percentage into a descriptive category.
def get_confidence_label(confidence_pct: float) -> str:
    """Map model confidence (0–100 %) to a bucket."""
    if confidence_pct >= 85:
        return "High"
    elif confidence_pct >= 70:
        return "Medium"
    else:
        return "Low"


# ---------------------------------------------------------------------------
# Core prediction function
# ---------------------------------------------------------------------------

# Extracts profile data, formats features, and runs the machine learning funding readiness prediction.
def predict_funding_readiness(profile):
    """
    Accept a Profile model instance, build a DataFrame matching the trained
    pipeline's expected feature order, run prediction, and return results.

    Returns:
        dict with keys: score, label, confidence, confidence_label
    Raises:
        FileNotFoundError  — if model .pkl is missing
        ValueError         — if required profile fields are invalid
        Exception          — for unexpected prediction failures
    """

    model = _load_model()

    # ── Validate required fields ──────────────────────────────────────────
    required_numeric = {
        "funding_rounds": profile.funding_rounds,
        "founder_experience_years": profile.founder_experience_years,
        "team_size": profile.team_size,
        "market_size_billion": profile.market_size_billion,
        "product_traction_users": profile.product_traction_users,
        "burn_rate_rupees": profile.burn_rate_rupees,
        "monthly_revenue_rupees": profile.monthly_revenue_rupees,
    }

    missing = [k for k, v in required_numeric.items() if v is None]
    if missing:
        raise ValueError(
            f"Missing required fields: {', '.join(missing)}"
        )

    # ── Convert INR → Model scale ─────────────────────────────────────────
    # The model expects ANNUAL burn rate in Millions of USD
    burn_rate_million = (float(profile.burn_rate_rupees) / INR_TO_MILLION_USD) * 12

    # The model expects ANNUAL revenue in raw USD (despite the 'revenue_million' column name)
    # INR_TO_MILLION_USD is 83,00,000, so INR_TO_USD is 83.0
    inr_to_usd = INR_TO_MILLION_USD / 1_000_000
    revenue_million = (float(profile.monthly_revenue_rupees) / inr_to_usd) * 12

    # ── Map industry → sector (model was trained on 'sector' column) ──────
    sector = profile.industry or "Technology"

    # ── Build DataFrame in the EXACT column order the pipeline expects ────
    #    Categorical: sector, founder_background
    #    Numerical:   funding_rounds, founder_experience_years, team_size,
    #                 market_size_billion, product_traction_users,
    #                 burn_rate_million, revenue_million
    data = pd.DataFrame([{
        "funding_rounds": int(profile.funding_rounds),
        "founder_experience_years": int(profile.founder_experience_years),
        "team_size": int(profile.team_size),
        "market_size_billion": float(profile.market_size_billion),
        "product_traction_users": int(profile.product_traction_users),
        "burn_rate_million": burn_rate_million,
        "revenue_million": revenue_million,
        "sector": sector,
        "founder_background": profile.founder_background or "first_time",
    }])

    # ── Predict ───────────────────────────────────────────────────────────
    probabilities = model.predict_proba(data)[0]

    # Class 1 = success probability
    success_prob = float(probabilities[1])
    score = round(success_prob * 100, 2)
    confidence = round(float(max(probabilities)) * 100, 2)

    label = get_prediction_label(score)
    confidence_label = get_confidence_label(confidence)

    return {
        "score": score,
        "label": label,
        "confidence": confidence,
        "confidence_label": confidence_label,
    }
