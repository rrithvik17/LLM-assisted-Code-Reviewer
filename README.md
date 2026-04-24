# LLM Code Reviewer

A **full-stack AI-powered code reviewer** that analyzes Python code, detects real issues, explains them clearly, and generates corrected code — all running **locally using LLMs (Ollama)**.

Built with a focus on **accuracy, UX, and real-world usability**, this project combines **LLM reasoning + static analysis + modern UI** to create a developer-friendly review experience.

---

## Features

- **AI Code Review (LLM-powered)**
  - Uses local LLM (Llama 3 via Ollama)
  - Detects real bugs (not just style suggestions)

- **Smart Explanation Engine**
  - Clear, human-friendly explanations
  - Avoids hallucinated or irrelevant feedback

- **Automatic Code Correction**
  - Generates improved/fixed code when needed
  - Leaves code unchanged if already correct

- **Accurate Issue Detection**
  - Filters out unnecessary suggestions
  - Focuses only on real errors (logic, runtime, syntax)

- **Modern Professional UI**
  - Built with React + Tailwind
  - Clean, dark, developer-first interface
  - Pop-culture styled feedback (fun but professional)

- **Fully Local (No API Keys)**
  - Runs using Ollama
  - Privacy-friendly & cost-free

---

## Tech Stack

### Backend
- FastAPI
- Python AST (static analysis)
- Ollama (LLM runtime)

### Frontend
- React (Vite)
- Tailwind CSS
- Axios

### LLM
- Llama3 (via Ollama)

---

## 🧩 Architecture
