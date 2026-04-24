---
description: How to run the LLM Code Reviewer application
---

1. Ensure Ollama is running with the `codellama:7b` model:
   ```bash
   ollama run codellama:7b
   ```

2. Install dependencies:
   ```bash
   pip install fastapi uvicorn httpx streamlit requests
   ```

3. Start the FastAPI backend:
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

4. Start the React frontend:
   ```bash
   cd frontend
   npm run dev
   ```
