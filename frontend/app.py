import streamlit as st
import requests
import json

API = "http://localhost:8000/review"

st.set_page_config(page_title="LLM Code Reviewer", layout="wide")
st.title("🧠 LLM Code Reviewer")

code = st.text_area("Paste your Python code ↓", height=300)

if st.button("Review Code"):
    if not code.strip():
        st.error("Please paste some code.")
        st.stop()

    with st.spinner("Analyzing..."):
        response = requests.post(API, json={"code": code})

    # ---- SAFE JSON PARSING ----
    try:
        result = response.json()
    except:
        st.error("❌ Backend did not return JSON. Check raw output above.")
        st.stop()

    # ---- DISPLAY REVIEW ----
    if result.get("correct"):
        st.success("✅ Code is correct!")
    else:
        st.error("❌ Code has issues.")

    st.subheader("⚠ Issues Found")
    for issue in result.get("issues", []):
        st.error(issue)

    st.subheader("🧠 Explanation")
    st.write(result.get("explanation", "No explanation provided."))

    st.subheader("✨ Corrected Code")
    st.code(result.get("improved_code", "No corrected code returned."), language="python")
