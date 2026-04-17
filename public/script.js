const inputBox = document.getElementById("input");

inputBox.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const chat = document.getElementById("chat");
  const selectedDiv = document.getElementById("selected");
  const dpExplain = document.getElementById("dpExplain");
  const dpTableDiv = document.getElementById("dpTable");
  const lcsDiv = document.getElementById("lcsMatrix");

  const message = inputBox.value.trim();
  if (!message) return;

  inputBox.value = "";

  // USER MESSAGE
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.innerText = message;
  chat.appendChild(userMsg);

  // AI LOADING
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

    // ---------------- TYPING ----------------
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

    // ---------------- SELECTED ----------------
    selectedDiv.innerHTML = "";

    data.selected.forEach(m => {
      const div = document.createElement("div");
      div.className = "selected-msg";
      div.innerText = `${m.text} (LCS: ${m.similarity})`;
      selectedDiv.appendChild(div);
    });

    // ---------------- DP EXPLANATION ----------------
    dpExplain.innerHTML = `
      ✔ Selected ${data.selected.length} messages <br>
      ✔ LCS used for similarity <br>
      ✔ Knapsack used for optimization
    `;

    // ---------------- DP TABLE ----------------
    dpTableDiv.innerHTML = "";

    if (data.dpTable) {
      const table = document.createElement("table");

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
      dpTableDiv.innerText = "DP table not generated";
    }

    // ---------------- LCS MATRIX ----------------
    lcsDiv.innerHTML = "";

    if (data.lcsMatrix) {
      const table = document.createElement("table");

      data.lcsMatrix.forEach(row => {
        const tr = document.createElement("tr");

        row.forEach(cell => {
          const td = document.createElement("td");
          td.innerText = cell;
          td.style.border = "1px solid #666";
          td.style.padding = "3px";
          td.style.fontSize = "10px";
          tr.appendChild(td);
        });

        table.appendChild(tr);
      });

      lcsDiv.appendChild(table);
    }

  } catch (err) {
    aiMsg.innerText = "Error fetching response.";
  }

  chat.scrollTop = chat.scrollHeight;
}