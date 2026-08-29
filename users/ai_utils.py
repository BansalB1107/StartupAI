import logging
import os

from google import genai

logger = logging.getLogger(__name__)

# Read API Key from .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# Calls the Gemini API to analyze startup details and returns an investor-ready JSON report.
def generate_startup_report(pitch, industry):

    client = genai.Client(api_key=GEMINI_API_KEY)

    logger.info("Generating startup report via Gemini...")

    prompt = f"""
You are an expert startup mentor.

Analyze the following startup and generate a professional investor-ready report.

Industry:
{industry}

Startup Pitch:
{pitch}

IMPORTANT:

Return ONLY valid JSON.

Do NOT return markdown.
Do NOT use ```json.
Do NOT add explanations before or after JSON.
Return raw JSON only.

Use EXACTLY this structure:

{{
    "market_analysis": [
        "point 1",
        "point 2",
        "point 3"
    ],

    "swot_analysis": {{
        "strengths": [
            "strength 1",
            "strength 2",
            "strength 3"
        ],

        "weaknesses": [
            "weakness 1",
            "weakness 2",
            "weakness 3"
        ],

        "opportunities": [
            "opportunity 1",
            "opportunity 2",
            "opportunity 3"
        ],

        "threats": [
            "threat 1",
            "threat 2",
            "threat 3"
        ]
    }},

    "financial_roadmap": {{
        "Phase 1": "Short description",
        "Phase 2": "Short description",
        "Phase 3": "Short description"
    }},

    "growth_strategy": [
        "strategy 1",
        "strategy 2",
        "strategy 3"
    ],

    "target_audience": {{
        "Primary Audience": "description",
        "Secondary Audience": "description"
    }},

    "revenue_model": [
        "revenue stream 1",
        "revenue stream 2",
        "revenue stream 3"
    ],

    "competition_analysis": {{
        "Competitor 1": "analysis",
        "Competitor 2": "analysis",
        "Competitor 3": "analysis"
    }},

    "marketing_tactics": [
        "tactic 1",
        "tactic 2",
        "tactic 3"
    ],

    "operational_plan": {{
        "Phase 1": "description",
        "Phase 2": "description",
        "Phase 3": "description"
    }},

    "risk_assessment": {{
        "Market Risk": "description",
        "Financial Risk": "description",
        "Operational Risk": "description",
        "Legal Risk": "description"
    }},
    
    "Business_Model_Canvas": {{
        "Key Partners": "",
        "Key Activities": "",
        "Value Propositions": "",
        "Customer Relationships": "",
        "Customer Segments": "",
        "Key Resources": "",
        "Channels": "",
        "Cost Structure": "",
        "Revenue Streams": ""
    }},
    
    "Investor_Readiness": {{
        "overall_score": a,
        "market_potential": b,
        "scalability": c,
        "financial_viability": d,
        "innovation": e,
        "recommendation": ""
        a,b,c,d,e: "score it out of 100"

    }},
    
    "MVP_Features": {{
        "Must Have": [],
        "Should Have": [],
        "Nice to Have": []
    }},
    
    "Funding_Strategy": {{
        "recommended_stage": "Pre-Seed",
        "recommended_funding_amount": "₹25-50 Lakhs",
        "possible_sources": [
            "Angel Investors",
            "Startup India",
            "Venture Capital"
        ]
    }},
        
}}

Rules:

1. Every array must contain at least 3 items.
2. Keep each point concise but professional.
3. Do not leave any field empty.
4. Use business language suitable for investors.
5. Return valid JSON parsable by Python's json.loads().
6. Tailor the analysis specifically to the provided startup idea.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )

        logger.info("Gemini report generated successfully.")

        return response.text

    except Exception as e:

        logger.exception("Gemini report generation failed.")

        print("=" * 80)
        print("ACTUAL GEMINI ERROR:")
        print(e)
        print("=" * 80)
        
        raise Exception(str(e))

# Uses AI to explain a startup's funding readiness score and provides actionable improvement recommendations.
def generate_funding_explanation(profile, score, label):

    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = f"""
You are an expert startup funding advisor.

A startup received a Funding Readiness Score of {score}% ({label}).

Startup details:
- Founder Experience: {profile.founder_experience_years} years
- Founder Background: {profile.founder_background}
- Monthly Revenue: ₹{profile.monthly_revenue_rupees:,.0f}
- Monthly Burn Rate: ₹{profile.burn_rate_rupees:,.0f}
- Monthly Active Users: {profile.product_traction_users:,}
- Team Size: {profile.team_size}
- Market Size: {profile.market_size_billion} Billion USD
- Funding Rounds Completed: {profile.funding_rounds}
- Industry: {profile.industry or "General"}

Explain why the startup received this score.

Mention:
- founder experience
- revenue
- burn rate
- user traction
- team size
- market size

Then provide exactly 3 practical recommendations.

Maximum 180 words.
Plain text only.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )

        return response.text.strip()

    except Exception as e:

        logger.exception("Funding explanation generation failed.")

        error = str(e)

        if "RESOURCE_EXHAUSTED" in error or "429" in error:
            return (
                "AI explanation is temporarily unavailable because the "
                "Gemini API daily quota has been exceeded."
            )

        return (
            "AI explanation is temporarily unavailable. "
            "Please try again later."
        )