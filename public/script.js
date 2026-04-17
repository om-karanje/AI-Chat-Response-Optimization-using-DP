const inputBox = document.getElementById("input");
inputBox.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }});

async function sendMessage() {
  const chat = document.getElementById("chat");
  const selectedDiv = document.getElementById("selected");
  const dpExplain = document.getElementById("dpExplain");
  const dpTableDiv = document.getElementById("dpTable");
  const message = inputBox.value.trim();
  if (!message) return;
  inputBox.value = "";

  // user msg
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.innerText = message;
  chat.appendChild(userMsg);

  // ai msg (typing placeholder)
  const aiMsg = document.createElement("div");
  aiMsg.className = "message ai loading";
  aiMsg.innerText = "Typing...";
  chat.appendChild(aiMsg);

  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    //typing effect
    const text = data.reply.trim();
    aiMsg.classList.remove("loading");
    aiMsg.innerHTML = "";

    let i = 0;
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.innerHTML = "&nbsp;";

    function typeEffect() {
      if (i < text.length) {
        aiMsg.innerHTML = text.substring(0, i + 1);
        aiMsg.appendChild(cursor);
        i++;
        setTimeout(typeEffect, 15);
      } else {
        cursor.remove();
        aiMsg.innerText = text;
      }
    }
    typeEffect();

    //selected context
    selectedDiv.innerHTML = "";
    data.selected.forEach(m => {
      const div = document.createElement("div");
      div.className = "selected-msg";
      div.innerText = m.text;
      selectedDiv.appendChild(div);
    });

    // dp explaination
    dpExplain.innerHTML = `
      ✔ Selected ${data.selected.length} messages <br>
      ✔ Based on token constraint <br>
      ✔ Optimized using Knapsack DP
    `;

    // dp table
    dpTableDiv.innerHTML = "";
    if (data.dpTable) {
      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";

      data.dpTable.forEach(row => {
        const tr = document.createElement("tr");

        row.forEach(cell => {
          const td = document.createElement("td");
          td.innerText = cell;
          td.style.border = "1px solid #555";
          td.style.padding = "4px";
          td.style.fontSize = "10px";
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });

      dpTableDiv.appendChild(table);
    } else {
      dpTableDiv.innerText = "DP table not generated (fallback used)";
    }

  } catch (err) {
    aiMsg.innerText = "Error fetching response.";
  }

  chat.scrollTop = chat.scrollHeight;
}