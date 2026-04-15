import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../public"));

console.log("OPENROUTER KEY:", process.env.OPENROUTER_API_KEY);

let chatHistory = [];

// ---------------- TOKEN ----------------
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// ---------------- IMPORTANCE ----------------
function calculateImportance(msg, query, index) {
  let score = 1;

  if (msg.text.toLowerCase().includes(query.toLowerCase())) {
    score += 5;
  }

  score += index * 1.5; // recency boost
  return score;
}

// ---------------- RELEVANCE ----------------
function isRelevant(msg, query) {
  const qWords = query.toLowerCase().split(" ");
  const text = msg.text.toLowerCase();
  return qWords.some(word => text.includes(word));
}

// ---------------- RUN C++ DP ----------------
function runCPP(messages, maxTokens) {
  return new Promise((resolve, reject) => {
    let input = `${messages.length} ${maxTokens}\n`;

    messages.forEach(m => {
      input += `${m.tokens} ${Math.floor(m.importance)} ${m.text}\n`;
    });

    // 🔥 FIXED PATH FOR WINDOWS
    const process = exec(".\\dp.exe", (error, stdout) => {
      if (error) {
        console.error("DP EXEC ERROR:", error);
        return reject(error);
      }

      console.log("RAW OUTPUT:\n", stdout);

      const lines = stdout.trim().split("\n");

      let table = [];
      let selected = [];
      let mode = "";

      lines.forEach(line => {
        line = line.trim();

        if (line === "TABLE") mode = "table";
        else if (line === "SELECTED") mode = "selected";
        else if (mode === "table") {
          table.push(line.split(/\s+/).map(Number));
        } else if (mode === "selected") {
          selected = line.split(/\s+/).map(Number);
        }
      });

      resolve({ table, selected });
    });

    process.stdin.write(input);
    process.stdin.end();
  });
}

// ---------------- CHAT ROUTE ----------------
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  chatHistory.push({ text: message, role: "user" });

  const maxTokens = 300;

  // 🔥 Ensure enough context
  const recentHistory = chatHistory.slice(-5);

  const filteredHistory = chatHistory.filter(msg =>
    isRelevant(msg, message)
  );

  const baseHistory = [...new Map(
    [...filteredHistory, ...recentHistory].map(m => [m.text, m])
  ).values()];

  const enriched = baseHistory.map((msg, i) => ({
    ...msg,
    tokens: estimateTokens(msg.text),
    importance: calculateImportance(msg, message, i)
  }));

  try {
    const result = await runCPP(enriched, maxTokens);

    console.log("DP RESULT:", result);

    const selectedMessages = result.selected.map(i => enriched[i]);

    // 🔥 fallback safety
    const finalSelected =
      selectedMessages.length > 0
        ? selectedMessages
        : baseHistory.slice(-2);

    // ---------------- PROMPT ----------------
    const contextText =
      "You are a helpful assistant.\n\n" +
      "Answer the CURRENT question using previous context if needed.\n\n" +
      "Conversation:\n" +
      finalSelected.map(m => m.text).join("\n") +
      "\n\nCurrent question:\n" +
      message;

    // ---------------- API CALL ----------------
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages: [
          { role: "user", content: contextText }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    chatHistory.push({ text: reply, role: "assistant" });

    // ---------------- FINAL RESPONSE ----------------
    res.json({
      reply,
      selected: finalSelected,
      dpTable: result.table.length > 0 ? result.table : null
    });

  } catch (err) {
    console.error(err.response?.data || err.message);

    res.json({
      reply: "Error occurred",
      selected: [],
      dpTable: null
    });
  }
});

// ---------------- START ----------------
app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);