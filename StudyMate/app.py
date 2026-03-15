from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# 🔑 PUT YOUR GROQ API KEY HERE
API_KEY = ""

def ask_ai(prompt):

    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code != 200:
        return "API Error: " + response.text

    result = response.json()

    return result["choices"][0]["message"]["content"]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/quiz")
def quiz():
    return render_template("quiz.html")


@app.route("/flashcards")
def flashcards():
    return render_template("flashcards.html")


@app.route("/generate", methods=["POST"])
def generate():

    topic = request.json["topic"]
    level = request.json["level"]

    prompt = f"Explain {topic} in {level} level."

    answer = ask_ai(prompt)

    return jsonify({"result": answer})


@app.route("/generate_quiz", methods=["POST"])
def generate_quiz():

    topic = request.json["topic"]

    prompt = f"Create 5 quiz questions about {topic}."

    result = ask_ai(prompt)

    return jsonify({"quiz": result})


@app.route("/generate_flashcards", methods=["POST"])
def generate_flashcards():

    topic = request.json["topic"]

    prompt = f"Create flashcards for {topic} in Question and Answer format."

    result = ask_ai(prompt)

    return jsonify({"flashcards": result})


if __name__ == "__main__":
    app.run(debug=True)