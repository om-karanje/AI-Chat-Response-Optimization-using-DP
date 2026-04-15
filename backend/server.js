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

// ---------------- TOKEN ESTIMATION ----------------
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// ---------------- IMPORTANCE SCORING ----------------
function calculateImportance(msg, query, index) {
  let score = 1;

  if (msg.text.toLowerCase().includes(query.toLowerCase())) {
    score += 5;
  }

  score += index * 0.5; // recency boost
  return score;
}

// ---------------- RELEVANCE FILTER ----------------
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

    const process = exec("dp.exe", (error, stdout) => {
      if (error) return reject(error);

      const indices = stdout.trim().split(" ").map(Number);
      resolve(indices);
    });

    process.stdin.write(input);
    process.stdin.end();
  });
}

// ---------------- CHAT API ----------------
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  // Add user message
  chatHistory.push({ text: message, role: "user" });

  const maxTokens = 300;

  // ---------------- STEP 1: FILTER RELEVANT ----------------
  const filteredHistory = chatHistory.filter(msg =>
    isRelevant(msg, message)
  );

  // ---------------- STEP 2: FALLBACK ----------------
  const baseHistory =
    filteredHistory.length > 0
      ? filteredHistory
      : chatHistory.slice(-2);

  // ---------------- STEP 3: PREPARE FOR DP ----------------
  const enriched = baseHistory.map((msg, i) => ({
    ...msg,
    tokens: estimateTokens(msg.text),
    importance: calculateImportance(msg, message, i)
  }));

  try {
    // ---------------- STEP 4: RUN DP ----------------
    const selectedIndexes = await runCPP(enriched, maxTokens);
    const selectedMessages = selectedIndexes.map(i => enriched[i]);

    // ---------------- STEP 5: BUILD PROMPT ----------------
    const contextText =
      "You are a helpful assistant.\n\n" +
      "STRICT RULE: Answer ONLY the current question. Ignore irrelevant context.\n\n" +
      "Previous context:\n" +
      selectedMessages.map(m => m.text).join("\n") +
      "\n\nCurrent question:\n" +
      message;

    // ---------------- STEP 6: CALL OPENROUTER ----------------
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "user",
            content: contextText
          }
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

    // Save AI response
    chatHistory.push({ text: reply, role: "assistant" });

    res.json({
      reply,
      selected: selectedMessages
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.json({ reply: "Error occurred", selected: [] });
  }
});

// ---------------- START SERVER ----------------
app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);



