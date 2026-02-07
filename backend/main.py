from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ast, uuid, httpx, re

app = FastAPI(title="LLM Code Reviewer - Stable for CodeLlama 7B")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

    # Syntax errors
    try:
        ast.parse(code)
    except SyntaxError as e:
        errors.append(f"Syntax Error: {e.msg} at line {e.lineno}")
        return errors

    tree = ast.parse(code)

    # Detect common mistakes
    for node in ast.walk(tree):

        # Division by zero
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Div):
            if isinstance(node.right, ast.Constant) and node.right.value == 0:
                errors.append("Division by zero detected")

        # Type mismatch: string + integer
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            if isinstance(node.left, ast.Constant) and isinstance(node.right, ast.Constant):
                if type(node.left.value) != type(node.right.value):
                    errors.append("Adding string + integer causes TypeError")

    return errors


# -----------------------------
# CALL CODELLAMA LLM
# -----------------------------
async def call_llm(prompt):
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "codellama:7b",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=300
            )
            return r.json().get("response", "")
    except Exception as e:
        return f"LLM ERROR: {str(e)}"


# -----------------------------
# MAIN REVIEW ENDPOINT
# -----------------------------
@app.post("/review")
async def review(req: ReviewRequest):

    code = req.code

    # Step 1: Static error scan
    static_errors = static_check(code)

    # Step 2: Ask LLM to review code in plain text format
    prompt = f"""
You are an expert Python code reviewer.

Respond EXACTLY in this format (plain text, no JSON):

ISSUES:
- issue 1
- issue 2
(Write "none" if no issues)

EXPLANATION:
Detailed explanation here.

IMPROVED_CODE:
<corrected full code>

Code:
{code}
"""

    llm_output = await call_llm(prompt)
    text = llm_output.strip()

    # -------- CASE 1: LLM SAYS "none" FOR ISSUES → CODE IS CORRECT --------
    try:
        issues_section = text.lower().split("issues:")[1].split("explanation:")[0].strip()
    except:
        issues_section = ""

    if "none" in issues_section or "no issues" in issues_section:
        return {
            "correct": True,
            "issues": [],
            "explanation": text,
            "improved_code": code
        }

    # -------- EXTRACT SECTIONS SAFELY --------
    issues_match = re.search(r"ISSUES:(.*?)(EXPLANATION:)", text, re.DOTALL | re.IGNORECASE)
    explanation_match = re.search(r"EXPLANATION:(.*?)(IMPROVED_CODE:)", text, re.DOTALL | re.IGNORECASE)
    improved_match = re.search(r"IMPROVED_CODE:(.*)", text, re.DOTALL | re.IGNORECASE)

    issues_text = issues_match.group(1).strip() if issues_match else "Could not extract issues."
    explanation_text = explanation_match.group(1).strip() if explanation_match else text
    improved_code = improved_match.group(1).strip() if improved_match else code

    # -------- MERGE STATIC ERRORS + LLM DISCOVERED ISSUES --------
    issues_list = []

    # Static errors first (most reliable)
    if static_errors:
        issues_list.extend(static_errors)

    # Add LLM issues
    if "none" not in issues_text.lower():
        for line in issues_text.split("\n"):
            clean = line.strip("-• ").strip()
            if clean:
                issues_list.append(clean)

    correct = len(issues_list) == 0

    return {
        "correct": correct,
        "issues": issues_list,
        "explanation": explanation_text,
        "improved_code": improved_code
    }
