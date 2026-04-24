from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ast, httpx, re, os

app = FastAPI(title="LLM Code Reviewer - Stable & Secure")

# Configuration (In production, use environment variables)
LLM_URL = os.getenv("LLM_URL", "http://localhost:11434/api/generate")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ReviewRequest(BaseModel):
    code: str


# -----------------------------
# STATIC CHECKS (Basic Python Error Detection)
# -----------------------------
def static_check(code):
    errors = []
    try:
        # Use a single parse call for efficiency
        tree = ast.parse(code)
    except SyntaxError as e:
        errors.append(f"Syntax Error: {e.msg} at line {e.lineno}")
        return errors

    # Detect common mistakes
    for node in ast.walk(tree):

        # Division by zero
        if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Div, ast.FloorDiv, ast.Mod)):
            if isinstance(node.right, ast.Constant) and node.right.value == 0:
                errors.append("Division by zero detected")

        # Type mismatch: string + non-string (improved logic)
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            if isinstance(node.left, ast.Constant) and isinstance(node.right, ast.Constant):
                l_val, r_val = node.left.value, node.right.value
                # Flag string + non-string additions
                if isinstance(l_val, str) != isinstance(r_val, str):
                    errors.append("Adding string and non-string types causes TypeError")

    return errors


# -----------------------------
# CALL LLAMA LLM
# -----------------------------
async def call_llm(prompt):
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                LLM_URL,
                json={
                    "model": "llama3.2:latest",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=60  # Reduced timeout for responsiveness
            )
            r.raise_for_status()
            return r.json().get("response", "")
    except httpx.HTTPError as e:
        return f"LLM ERROR: API connection failed ({str(e)})"
    except Exception as e:
        return f"LLM ERROR: Unexpected error ({str(e)})"


# -----------------------------
# MAIN REVIEW ENDPOINT
# -----------------------------
@app.post("/review")
async def review(req: ReviewRequest):

    code = req.code

    # Step 1: Static error scan
    static_errors = static_check(code)

    # Step 2: Ask LLM to review code
    prompt = f"""
You are a highly experienced Python code reviewer.

================ CORE RULE =================
ONLY report REAL ERRORS.
DO NOT report: Style improvements, Naming suggestions, Alternative approaches, or Subjective opinions.

================ WHAT COUNTS AS AN ISSUE =================
ONLY include: Syntax errors, Runtime errors, Logical bugs, and Incorrect outputs.
If code is logically correct → it MUST be marked as correct.

================ OUTPUT FORMAT (PLAIN TEXT) =================
ISSUES:
- If real bugs exist → list them
- If NO real bugs → write EXACTLY: NONE

EXPLANATION:
- Explain what the code does
- Clearly state if it is correct

IMPROVED_CODE:
- If incorrect → fix it
- If correct → return SAME code

CODE TO REVIEW:
{code}
"""

    llm_output = await call_llm(prompt)
    text = llm_output.strip()

    # SECTION EXTRACTION HELPER
    def extract_section(label, content, next_label=None):
        pattern = rf"{label}:(.*?)(?={next_label}:|$)" if next_label else rf"{label}:(.*)"
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        if not match: return ""
        
        extracted = match.group(1).strip()
        # Robustly strip markdown blocks for improved_code
        if label.upper() == "IMPROVED_CODE":
            # Match ```[lang] ... ``` and take the content inside
            code_match = re.search(r"```(?:[a-zA-Z]*\n)?(.*?)```", extracted, re.DOTALL)
            if code_match:
                extracted = code_match.group(1).strip()
            else:
                extracted = extracted.strip("`").strip()
        return extracted

    issues_text = extract_section("ISSUES", text, "EXPLANATION")
    explanation_text = extract_section("EXPLANATION", text, "IMPROVED_CODE")
    improved_code = extract_section("IMPROVED_CODE", text)

    # -------- MERGE STATIC ERRORS + LLM DISCOVERED ISSUES --------
    issues_list = static_errors.copy()

    # Add LLM issues (with more robust filtering)
    if issues_text:
        lowercase_issues = issues_text.lower()
        skip_phrases = ["none", "no issues", "no problems", "no errors", "nothing found"]
        if not any(p in lowercase_issues for p in skip_phrases):
            for line in issues_text.split("\n"):
                clean = line.strip("-• 123456789. ").strip()
                if clean:
                    issues_list.append(clean)

    return {
        "correct": len(issues_list) == 0,
        "issues": issues_list,
        "explanation": explanation_text or (text if not issues_list else "No explanation generated."),
        "improved_code": improved_code or code
    }
