// ai_script.js - AI Chat Popup

// Elements
const popup       = document.getElementById("ai-popup");
const floatBtn    = document.getElementById("ai-float-btn");
const input       = document.getElementById("question-input");
const sendBtn     = document.getElementById("ask-button");
const output      = document.getElementById("answer-output");
const closeBtn    = document.getElementById("close-ai");

// Toggle popup visibility
floatBtn.addEventListener("click", () => {
  const isHidden = popup.style.display !== "flex";
  popup.style.display = isHidden ? "flex" : "none";
  
  if (isHidden) {
    input.focus();
    // Optional: breathing animation stop when open
    floatBtn.classList.remove("breathing");
  } else {
    floatBtn.classList.add("breathing");
  }
});

// Close popup
closeBtn.addEventListener("click", () => {
  popup.style.display = "none";
  floatBtn.classList.add("breathing");
});

// Create message bubble
function createMessage(text, isUser = false) {
  const div = document.createElement("div");
  div.className = isUser ? "user-message" : "ai-message";
  div.innerHTML = text;
  output.appendChild(div);
  output.scrollTo({ top: output.scrollHeight, behavior: "smooth" });
  return div;
}

// Typing indicator (dots animation)
function startTypingIndicator() {
  const msg = createMessage("<b>AI</b> размислува");
  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    msg.innerHTML = `<b>AI</b> размислува${".".repeat(dots)}`;
  }, 400);
  return { msg, interval };
}

// Main send function
async function sendQuestion() {
  const question = input.value.trim();
  if (!question) return;

  createMessage(`<b>Ти:</b> ${question}`, true);
  input.value = "";
  input.disabled = true;
  sendBtn.disabled = true;

  const { msg, interval } = startTypingIndicator();

  try {
    const response = await fetch("http://localhost:5000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })          // backend expects "question"
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    clearInterval(interval);
    msg.innerHTML = `<b>AI:</b> ${data.answer || "Нема одговор..."}`;
  } catch (err) {
    clearInterval(interval);
    msg.innerHTML = `<b>AI:</b> <span style="color:#ff6b6b;">Грешка при поврзување. Проверете ја конзолата.</span>`;
    console.error("AI fetch error:", err);
  }

  input.disabled = false;
  sendBtn.disabled = false;
  input.focus();
}

// Send on button click
sendBtn.addEventListener("click", sendQuestion);

// Send on Enter (without Shift)
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendQuestion();
  }
});

// Optional: breathing animation on float button
if (floatBtn) {
  floatBtn.classList.add("breathing");
}