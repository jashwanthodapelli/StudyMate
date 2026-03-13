from flask import Flask, render_template, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def call_ai(prompt: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-flash")
    resp = model.generate_content(prompt)
    return resp.text



@app.route("/generate", methods=["POST"])
def generate():

    data=request.json
    notes=data["notes"]
    level=data["level"]

    prompt=f"""
Explain these notes for a {level} student.

Return in sections:

Explanation:
Summary:
Quiz:
Flashcards:
{notes}
"""

    response=client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[{"role":"user","content":prompt}]
    )

    text=response.choices[0].message.content

    return jsonify({
    "explanation":text,
    "summary":text,
    "quiz":text,
    "flashcards":[text]
    })


@app.route("/chat", methods=["POST"])
def chat():

    question=request.json["question"]

    response=client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[{"role":"user","content":question}]
    )

    return jsonify({"answer":response.choices[0].message.content})


if __name__ == "__main__":
    app.run(debug=True)