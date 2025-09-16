import os
import re
from collections import defaultdict

from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv

# ------------------------ Load ENV ------------------------
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing in .env")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing in .env")

# ------------------------ Init App/Clients ------------------------
app = Flask(__name__)
CORS(app)
engine = create_engine(DATABASE_URL)

genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# ------------------------ Metric Categories ------------------------
HIGHER_BETTER = {
    "basic_eps", "diluted_eps", "cash_eps", "book_value_share", "dividend_share",
    "revenue_from_operations_share", "pbdit_share", "pbit_share", "pbt_share", "net_profit_share",
    "gross_profit_margin", "net_profit_margin", "operating_profit_margin",
    "ebit_margin", "ebitda_margin",
    "return_on_investment", "roe", "roa", "roce", "retention_ratio",
    "current_ratio_x", "quick_ratio_x", "cash_ratio_x",
    "interest_coverage_ratio_x", "shareholder_equity_ratio", "altman_z_score",
    "operating_leverage_ratio_x", "asset_turnover_ratio",
    "inventory_turnover_ratio", "receivables_turnover_ratio", "payables_turnover_ratio"
}
LOWER_BETTER = {
    "total_debt_equity_x", "debt_ratio", "long_term_debt_equity_x",
    "short_term_debt_equity_x", "net_debt_equity_x",
    "effective_tax_rate", "cost_to_income_ratio",
    "nonperforming_assets_ratio", "gross_npa_ratio", "net_npa_ratio"
}

# ------------------------ Metric Normalization ------------------------
def normalize_metric_name(name: str) -> str:
    """Normalize metric names for reliable matching."""
    if not name:
        return ""
    name = name.lower().strip()

    repl = {
        "earnings per share": "eps",
        "basic earnings per share": "basic_eps",
        "basic earnings": "basic_eps",
        "diluted earnings per share": "diluted_eps",
        "cash eps": "cash_eps",
        "book value / share": "book_value_share",
        "book value per share": "book_value_share",
        "dividend / share": "dividend_share",
        "revenue from operations / share": "revenue_from_operations_share",
        "pbdit / share": "pbdit_share",
        "pbit / share": "pbit_share",
        "pbt / share": "pbt_share",
        "net profit / share": "net_profit_share",
        "gross profit margin": "gross_profit_margin",
        "operating profit margin": "operating_profit_margin",
        "net profit margin": "net_profit_margin",
        "ebit margin": "ebit_margin",
        "ebitda margin": "ebitda_margin",
        "return on equity": "roe",
        "return on assets": "roa",
        "return on capital employed": "roce",
        "return on investment": "return_on_investment",
        "retention ratio": "retention_ratio",
        "inventory turnover ratio": "inventory_turnover_ratio",
        "receivables turnover ratio": "receivables_turnover_ratio",
        "payables turnover ratio": "payables_turnover_ratio",
        "shareholders equity ratio": "shareholder_equity_ratio",
        "altman z score": "altman_z_score",
        "cash ratio (x)": "cash_ratio_x",
        "current ratio (x)": "current_ratio_x",
        "quick ratio (x)": "quick_ratio_x",
        "interest coverage ratio (x)": "interest_coverage_ratio_x",
        "operating leverage ratio (x)": "operating_leverage_ratio_x",
        "asset turnover ratio": "asset_turnover_ratio",
        "long term debt / equity (x)": "long_term_debt_equity_x",
        "short term debt / equity (x)": "short_term_debt_equity_x",
        "net debt / equity (x)": "net_debt_equity_x",
        "total debt / equity (x)": "total_debt_equity_x",
        "debt / equity (x)": "total_debt_equity_x",
        "debt ratio": "debt_ratio",
        "effective tax rate (%)": "effective_tax_rate",
        "cost to income ratio": "cost_to_income_ratio",
        "gross npa ratio": "gross_npa_ratio",
        "net npa ratio": "net_npa_ratio",
    }

    for k, v in repl.items():
        if k in name:
            name = name.replace(k, v)

    name = re.sub(r"[₹()%/-]", " ", name)
    name = re.sub(r"\s+", "_", name)
    name = re.sub(r"[^a-z0-9_]+", "", name).strip("_")
    return name

# ------------------------ DB Helpers ------------------------
def list_companies():
    q = text("SELECT name FROM companies ORDER BY name;")
    with engine.connect() as conn:
        rows = conn.execute(q).fetchall()
    return [r[0] for r in rows]

def fetch_year_rows(year: int):
    q = text("""
        SELECT c.name, v.fiscal_year, m.name, v.value
        FROM metric_values v
        JOIN companies c ON v.company_id = c.company_id
        JOIN financial_metrics m ON v.metric_id = m.metric_id
        WHERE v.fiscal_year = :year
    """)
    with engine.connect() as conn:
        return conn.execute(q, {"year": year}).fetchall()

def fetch_company_year(company: str, year: int):
    q = text("""
        SELECT m.name, v.value
        FROM metric_values v
        JOIN financial_metrics m ON v.metric_id = m.metric_id
        JOIN companies c ON v.company_id = c.company_id
        WHERE c.name ILIKE :company AND v.fiscal_year = :year
    """)
    with engine.connect() as conn:
        return conn.execute(q, {"company": f"%{company}%", "year": year}).fetchall()

# ------------------------ Scoring (Min–Max) ------------------------
def top_companies(year, top_n=10):
    df = recalc_scores([year])
    if df.empty:
        return f"⚠️ No scores found for {year}."

    # Ensure year is integer
    df["year"] = df["year"].astype(int)
    year = int(year)

    # Filter valid scores
    top_df = df[df["year"] == year].dropna(subset=["score"]).sort_values("score", ascending=False).head(top_n)

    if top_df.empty:
        return f"⚠️ No top companies found for {year}."

    return f"📊 Top {top_n} Companies ({year}):\n" + \
           "\n".join(f"- {r.name}: {r.score:.4f}" for r in top_df.itertuples(index=False))

def recalc_scores(years=None):
    if years is None:
        years = [2024]

    all_records = []
    for yr in years:
        rows = fetch_year_rows(yr)
        if not rows:
            continue
        bucket = defaultdict(dict)
        for company_name, fiscal_year, metric_name, value in rows:
            key = (company_name, fiscal_year)
            bucket[key]["name"] = company_name
            bucket[key]["year"] = fiscal_year
            try:
                val = float(value)
            except Exception:
                continue
            bucket[key][normalize_metric_name(metric_name)] = val
        all_records.extend(bucket.values())

    if not all_records:
        return pd.DataFrame()

    df = pd.DataFrame(all_records)
    metric_cols = [c for c in df.columns if c not in {"name", "year"}]
    score_cols=[]
    for c in metric_cols:
        def normalize_series(s):
            if s.notna().sum() <= 1:
                return pd.Series([1.0] * len(s), index=s.index)
            vmin, vmax = s.min(), s.max()
            if pd.isna(vmin) or pd.isna(vmax) or vmin == vmax:
                return pd.Series([1.0] * len(s), index=s.index)
            if c in LOWER_BETTER:
                return 1 - (s - vmin) / (vmax - vmin)
            return (s - vmin) / (vmax - vmin)

        df[f"{c}_score"] = df.groupby("year")[c].transform(normalize_series)
        score_cols.append(f"{c}_score")

    df["score"] = df[score_cols].mean(axis=1).round(4)
    df["rank"] = df.groupby("year")["score"].rank(ascending=False, method="min")
    df["rank"] = df["rank"].fillna(0).astype(int)

    return df.sort_values(["year", "score"], ascending=[True, False])

# ------------------------ Command Handlers ------------------------
def handle_list_companies(limit=20):
    companies = list_companies()
    if not companies:
        return "⚠️ No companies found."
    limited = companies[:limit]
    return "📋 Companies (showing first {}):\n".format(len(limited)) + "\n".join(f"- {c}" for c in limited)

def handle_all_scores(year: int, top_n=20):
    df = recalc_scores([year])
    if df.empty:
        return f"⚠️ No scores found for {year}."

    # Ensure scores are numeric
    df["score"] = pd.to_numeric(df["score"], errors="coerce")

    # Rank companies safely (NaNs stay NaN)
    df["rank"] = df.groupby("year")["score"].rank(ascending=False, method="min")

    # Filter top N companies with valid scores
    top_df = df[df["year"] == year].dropna(subset=["score"]).sort_values("score", ascending=False).head(top_n)

    return f"📊 Top {top_n} Company Scores ({year}):\n" + \
           "\n".join(f"- {r.name}: {r.score:.4f}" for r in top_df.itertuples(index=False))

def handle_summary_of(company: str, year: int):
    rows = fetch_company_year(company, year)
    if not rows:
        return f"⚠️ No data found for {company} in {year}."
    metrics = {normalize_metric_name(m): v for m, v in rows}
    return f"📄 Summary of {company.title()} ({year}):\n" + "\n".join(f"- {k}: {v}" for k, v in metrics.items())

def handle_company_metric(company: str, metric_input: str, year: int):
    rows = fetch_company_year(company, year)
    if not rows:
        return f"⚠️ No data found for {company} in {year}."
    normalized_map = {normalize_metric_name(m): (m, v) for m, v in rows}
    needle = normalize_metric_name(metric_input)
    if needle in normalized_map:
        orig, val = normalized_map[needle]
        return f"📊 {company.title()} — {orig} in {year}: {val}"
    for k, (orig, val) in normalized_map.items():
        if needle in k or k in needle:
            return f"📊 {company.title()} — {orig} in {year}: {val}"
    return f"⚠️ Metric '{metric_input}' not found for {company} in {year}."

def ask_gemini_fallback(user_input: str) -> str:
    prompt = (
        "You are a fintech expert. "
        "Only answer fintech-related queries. "
        "If unrelated, politely say so. "
        "Keep your answer short, one paragraph max.\n\n"
        f"User question: {user_input}"
    )
    try:
        return gemini_model.generate_content(prompt).text.strip()
    except Exception as e:
        return f"⚠️ Gemini error: {str(e)}"

# ------------------------ Flask Routes ------------------------
@app.route("/")
def health():
    return jsonify({"status": "ok", "service": "Fintech Chatbot API"})

@app.route("/chat", methods=["POST"])
def chat():
    user_input = (request.json.get("message") or "").strip()
    if not user_input:
        return jsonify({"response": "Please type something."})

    q = user_input.lower()
    yr_match = re.search(r"\b(20\d{2})\b", q)
    year = int(yr_match.group(1)) if yr_match else 2024

    if "list companies" in q or "show companies" in q:
        return jsonify({"response": handle_list_companies(20)})
    if "all scores" in q or "company scores" in q:
        return jsonify({"response": handle_all_scores(year)})
    if "top 10 companies" in q or "top companies" in q:
        return jsonify({"response": top_companies(year, top_n=10)})
    if q.startswith("summary of"):
        company = " ".join(user_input.split()[2:])
        return jsonify({"response": handle_summary_of(company, year)})
    tokens = user_input.split()
    if len(tokens) >= 2:
        possible_year = tokens[-1]
        if re.fullmatch(r"20\d{2}", possible_year):
            year = int(possible_year)
            company_metric_part = " ".join(tokens[:-1])
        else:
            company_metric_part = user_input
        for cname in sorted(list_companies(), key=len, reverse=True):
            if company_metric_part.lower().startswith(cname.lower()):
                metric_input = company_metric_part[len(cname):].strip()
                if metric_input:
                    return jsonify({"response": handle_company_metric(cname, metric_input, year)})
    return jsonify({"response": ask_gemini_fallback(user_input)})

# ------------------------ Run ------------------------
# for localhost only 
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

# to run on public network
# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)
