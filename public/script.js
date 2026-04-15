async function sendMessage() {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");
  const selectedDiv = document.getElementById("selected");

  const message = input.value;
  input.value = "";

  chat.innerHTML += `<p><b>You:</b> ${message}</p>`;

  const res = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  chat.innerHTML += `<p><b>AI:</b> ${data.reply}</p>`;

  selectedDiv.innerHTML = "";
  data.selected.forEach(m => {
    selectedDiv.innerHTML += `<p>${m.text}</p>`;
  });

  chat.scrollTop = chat.scrollHeight;
}