import os
import json
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def ask_ai(prompt, system_prompt="You are a helpful AI study assistant. Respond in JSON format where applicable.", json_mode=False):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/flashcards')
def flashcards():
    return render_template('flashcards.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    topic = data.get('topic')
    level = data.get('level', 'Beginner')
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
        
    prompt = f"Explain {topic} in a {level} level in a clear and structured way."
    
    explanation = ask_ai(prompt, system_prompt="You are a helpful study assistant. Provide clear, well-structured explanations.")
    
    if explanation:
        return jsonify({"explanation": explanation})
    else:
        return jsonify({"error": "Failed to generate explanation. Check your API key or try again."}), 500

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    topic = data.get('topic')
    try:
        count = int(data.get('count', 5))
    except (TypeError, ValueError):
        count = 5
    count = min(max(1, count), 25)
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
        
    prompt = (
        f"Generate {count} multiple choice questions about {topic}. "
        "Each question must have 4 options and clearly indicate the correct answer. "
        "Return the response ONLY as a JSON object with this exact structure:\n"
        "{\n"
        '  "questions": [\n'
        '    {\n'
        '      "question": "Question text here",\n'
        '      "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        '      "answer": "Option A"\n'
        "    }\n"
        "  ]\n"
        "}"
    )
    
    quiz_content = ask_ai(prompt, system_prompt="You are a precise JSON generator. Output valid JSON only, exactly matching the requested format.", json_mode=True)
    
    if quiz_content:
        try:
            quiz_json = json.loads(quiz_content)
            return jsonify(quiz_json)
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse quiz response from AI"}), 500
    else:
        return jsonify({"error": "Failed to generate quiz from AI"}), 500

@app.route('/generate_flashcards', methods=['POST'])
def generate_flashcards():
    data = request.json
    topic = data.get('topic')
    try:
        count = int(data.get('count', 5))
    except (TypeError, ValueError):
        count = 5
    count = min(max(1, count), 25)
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
        
    prompt = (
        f"Generate {count} flashcards for {topic} in Question and Answer format. "
        "Return ONLY a JSON object with this exact structure:\n"
        "{\n"
        '  "flashcards": [\n'
        '    {"question": "Question text", "answer": "Answer text"}\n'
        "  ]\n"
        "}"
    )
    
    flashcards_content = ask_ai(prompt, system_prompt="You are a precise JSON generator. Output valid JSON only, exactly matching the requested format.", json_mode=True)
    
    if flashcards_content:
        try:
            flashcards_json = json.loads(flashcards_content)
            return jsonify(flashcards_json)
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse flashcards response from AI"}), 500
    else:
        return jsonify({"error": "Failed to generate flashcards from AI"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
