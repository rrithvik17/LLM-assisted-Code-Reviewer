# LLM Code Reviewer
An LLM-powered code review system that analyzes Python code, detects issues, explains them clearly, and generates corrected code — all locally, without using paid APIs.
This project leverages CodeLlama (via Ollama) for intelligent code review, combines it with static analysis for reliability, and provides a clean Streamlit-based web interface for real-time interaction.

---

## Features
LLM-based code review using CodeLlama
Detects syntax errors, logical issues, and common runtime problems
Provides clear, human-readable explanations of detected issues
Automatically generates corrected / improved code when problems exist
Combines static analysis (AST) with LLM reasoning to reduce false positives
Clean and interactive web UI built using Streamlit
Runs completely locally (no OpenAI or paid APIs required)

---

## Architecture Overview
Frontend (Streamlit) → Backend (FastAPI) → Static Analysis (AST) + LLM Review (CodeLlama via Ollama)

Static analysis catches obvious errors such as syntax issues and type mismatches. The LLM performs deeper reasoning, explains issues, and generates corrected code. The backend structures the results and the frontend presents them in a user-friendly layout.

---

## Tech Stack
Python
FastAPI (Backend API)
Streamlit (Frontend UI)
CodeLlama 7B (Local LLM)
Ollama (LLM runtime)
Python AST (Static analysis)

---

## Prerequisites
Make sure the following are installed:
Python 3.9 or above
Ollama
Pull the CodeLlama model:
ollama pull codellama:7b

--- 

## How to Run the Project
Clone the repository
git clone https://github.com/your-username/llm-code-reviewer.git cd llm-code-reviewer

Create and activate a virtual environment
python -m venv .venv source .venv/bin/activate # Linux / macOS .venv\Scripts\activate # Windows

Install dependencies
pip install -r requirements.txt

Start the Ollama server
ollama serve

Run the backend (FastAPI)
cd backend uvicorn main:app --reload --port 8000

Run the frontend (Streamlit)
cd frontend streamlit run app.py

---

##🧪 Example Usage
Input code:
def add(a, b): return a + b
print(add("4", 5))

Output:
Issue detected: Type mismatch between string and integer

Explanation of why the error occurs
Automatically generated corrected code
---

##📌 Why This Project Matters
Demonstrates real-world usage of LLMs in software engineering
Shows how to integrate LLMs into full-stack applications
Handles unreliable LLM outputs gracefully
Fully local, privacy-friendly, and cost-free
Highly relevant for Software Engineering, ML, and AI roles


---

##🔮 Future Improvements
Multi-language support (JavaScript, Java)
Diff view (before vs after code)
Line-level error highlighting
Model selection support
Deployment as a hosted web service



VS Code extension
