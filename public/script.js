async function sendMessage() {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");
  const selectedDiv = document.getElementById("selected");
  const dpExplain = document.getElementById("dpExplain");

  const message = input.value;
  input.value = "";

  // Show user message
  chat.innerHTML += `<p class="user">You: ${message}</p>`;

  // 🔥 Loading animation
  const loadingId = "loading-" + Date.now();
  chat.innerHTML += `<p id="${loadingId}" class="loading">AI is typing...</p>`;
  chat.scrollTop = chat.scrollHeight;

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  // Remove loading
  document.getElementById(loadingId).remove();

  // Show AI reply
  chat.innerHTML += `<p class="ai">AI: ${data.reply}</p>`;

  // 🔥 Highlight selected messages
  selectedDiv.innerHTML = "";
  data.selected.forEach(m => {
    selectedDiv.innerHTML += `<div class="selected-msg">${m.text}</div>`;
  });

  // 🧠 DP Explanation
  dpExplain.innerHTML = `
    Selected ${data.selected.length} messages 
    based on token limit and importance score.
  `;

  chat.scrollTop = chat.scrollHeight;
}

const inputBox = document.getElementById("input");
inputBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});