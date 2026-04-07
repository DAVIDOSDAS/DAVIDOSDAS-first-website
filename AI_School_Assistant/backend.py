from flask import Flask, request, jsonify, render_template, make_response, send_from_directory
import json
import ollama
import os
import sqlite3

print("CURRENT WORKING DIR:", os.getcwd())

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, 
    static_folder=os.path.join(BASE_DIR, "../website/static"),
    static_url_path="/static"
)

# Load school content
with open(os.path.join(BASE_DIR, "content.json"), "r", encoding="utf-8") as f:
    website_content = json.load(f)

content_text = "\n".join([
    f"{key}: {value}"
    for key, value in website_content.items()
])

def init_db():
    conn = sqlite3.connect(os.path.join(BASE_DIR, "conversations.db"))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            answer TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_conversation(question, answer):
    conn = sqlite3.connect(os.path.join(BASE_DIR, "conversations.db"))
    conn.execute("INSERT INTO chats (question, answer) VALUES (?, ?)", (question, answer))
    conn.commit()
    conn.close()

def get_recent_chats(limit=10):
    conn = sqlite3.connect("conversations.db")
    rows = conn.execute(
        "SELECT question, answer FROM chats ORDER BY timestamp DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return rows

def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS, GET"
    return response

@app.route("/")
def home():
    return send_from_directory(os.path.join(BASE_DIR, "../website"), "index.html")

@app.route("/index.html")
def index():
    return send_from_directory(os.path.join(BASE_DIR, "../website"), "index.html")

@app.route("/website_english/<path:filename>")
def serve_english(filename):
    return send_from_directory(os.path.join(BASE_DIR, "../website_english"), filename)

@app.route("/website_french/<path:filename>")
def serve_french(filename):
    return send_from_directory(os.path.join(BASE_DIR, "../website_french"), filename)

@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(os.path.join(BASE_DIR, "../website"), filename)

@app.route("/ask", methods=["POST", "OPTIONS"])
def ask():
    if request.method == "OPTIONS":
        resp = jsonify({})
        return add_cors(resp), 204

    data = request.get_json()
    question = (data or {}).get("question", "").strip()

    if not question:
        resp = jsonify({"answer": "Please type a question 😊"})
        return add_cors(resp)

    recent = get_recent_chats()
    history_text = "\n".join([f"Q: {q}\nA: {a}" for q, a in reversed(recent)])

    system_prompt = f"""You are the official AI Assistant for SOU Sv. Kiril i Metodij in Negotino, Macedonia.

CRITICAL RULE - LANGUAGE:
You MUST detect what language the user writes in and respond in THE SAME language.
ONLY these 3 languages are allowed: Macedonian, English, French.
If user writes in Macedonian → respond ONLY in Macedonian. No Serbian, no Croatian, no Bosnian. MACEDONIAN ONLY.
If user writes in English → respond ONLY in English.
If user writes in French → respond ONLY in French.
If user writes in any other language → say in English: "I can only respond in Macedonian, English or French😊"

RULES:
1. Always call the school by its full name: SOU Sv. Kiril i Metodij in Negotino, Macedonia.
2. If asked how to enroll, explain: online application via Ministry of Education portal, required documents are birth certificate and 6th-9th grade certificates, enrollment usually happens in June.
3. Be professional, helpful, and encourage students to choose a direction like IT or Economics.
4. Keep answers short — 1-3 sentences max.

School info:
{content_text}

Previous conversations to learn from:
{history_text}"""

    try:
        response = ollama.chat(
            model="llama3.1:8b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ]
        )
        answer = response['message']['content'].strip()
        save_conversation(question, answer)  # only saves on success
    except Exception as e:
        answer = f"Hmm, try again! Error: {str(e)}"

    resp = jsonify({"answer": answer})
    return add_cors(resp)

# Initialize DB and run
init_db()

if __name__ == '__main__':
    app.run(port=5000, debug=False, use_reloader=False)