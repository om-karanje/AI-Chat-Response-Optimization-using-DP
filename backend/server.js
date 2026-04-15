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

let chatHistory = [];

// Token estimator
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Importance scoring
function calculateImportance(msg, query, index) {
  let score = 1;

  if (msg.text.toLowerCase().includes(query.toLowerCase())) {
    score += 5;
  }

  score += index * 0.5; // recency
  return score;
}

// Run C++ program
function runCPP(messages, maxTokens) {
  return new Promise((resolve, reject) => {
    let input = `${messages.length} ${maxTokens}\n`;

    messages.forEach(m => {
      input += `${m.tokens} ${Math.floor(m.importance)} ${m.text}\n`;
    });

    const process = exec("backend/dp.exe", (error, stdout) => {
      if (error) return reject(error);

      const indices = stdout.trim().split(" ").map(Number);
      resolve(indices);
    });

    process.stdin.write(input);
    process.stdin.end();
  });
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  chatHistory.push({ text: message, role: "user" });

  const maxTokens = 300;

  const enriched = chatHistory.map((msg, i) => ({
    ...msg,
    tokens: estimateTokens(msg.text),
    importance: calculateImportance(msg, message, i)
  }));

  try {
    const selectedIndexes = await runCPP(enriched, maxTokens);
    const selectedMessages = selectedIndexes.map(i => enriched[i]);

    // Build prompt
    const contextText =
      "You are a helpful assistant.\n\n" +
      selectedMessages.map(m => m.text).join("\n");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: contextText }]
          }
        ]
      }
    );

    const reply =
      response.data.candidates[0].content.parts[0].text;

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

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);